import { createServer } from 'node:http';
import * as http2 from 'node:http2';
import { request as request1 } from 'node:https';
import { Readable } from 'node:stream';
import { connect as tlsConnect } from 'node:tls';

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Abstract, SYMBOL, Use } from '@produck/kitty-workflow';

import * as Kit from '@produck/kit';
import * as Http1Http from '@produck/kitty-deployer-http1-http';
import * as Http2Https from '@produck/kitty-deployer-http2-https';

import credentials from './credentials.mjs';
import Distributor from './Distributor.mjs';

const Deployer = Http2Https.Deployer.Http2HttpsDeployer;

class Workflow extends Abstract.Workflow {
  [SYMBOL.WORKFLOW._I.NORMALIZE_HTTP_RESPONSE_BODY_DATA](value) {
    if (value === undefined || value === null) {
      return { stream: null, length: 0 };
    }

    const buffer = Buffer.from(String(value));

    return {
      stream: Readable.toWeb(Readable.from([buffer])),
      length: buffer.length,
    };
  }
}

function createWorkflow(handler) {
  const workflow = new Workflow(Kit.global);

  workflow.setRequestBodyDistributorConstructor(Distributor);

  if (handler !== undefined) {
    workflow.use(handler);
  }

  return workflow.finalize();
}

async function serve(handler, options = {}) {
  const workflow = createWorkflow(handler);
  const server = http2.createSecureServer({
    ...credentials,
    allowHTTP1: true,
    ...options,
  });
  const sessions = new Set();

  server.on('session', (session) => sessions.add(session));
  await workflow.withDeployer(Deployer).deploy(server);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

  const { port } = server.address();

  return {
    port,
    close() {
      for (const session of sessions) {
        session.destroy();
      }

      return new Promise((resolve) => server.close(resolve));
    },
  };
}

const TIMEOUT = 3000;

function requestH2(port, headers = {}, body = undefined, options = {}) {
  return new Promise((resolve, reject) => {
    const client = http2.connect(`https://127.0.0.1:${port}`, {
      rejectUnauthorized: false,
      ...options,
    });
    const timer = setTimeout(() => {
      client.destroy();
      reject(new Error('request timeout'));
    }, TIMEOUT);

    client.on('error', reject);

    const stream = client.request({ ':path': '/', ...headers });
    let status = 0;
    let head = null;
    let data = '';

    stream.setEncoding('utf8');
    stream.on('response', (headers) => {
      head = headers;
      status = headers[':status'];
    });
    stream.on('data', (chunk) => (data += chunk));
    stream.on('end', () => {
      clearTimeout(timer);
      client.close();
      resolve({ status, headers: head, data });
    });
    stream.on('error', reject);
    stream.end(body);
  });
}

function requestHttp10(port) {
  return new Promise((resolve, reject) => {
    const socket = tlsConnect(
      { host: '127.0.0.1', port, rejectUnauthorized: false },
      () => {
        socket.write(
          ['GET /raw HTTP/1.0', 'Host: 127.0.0.1', '', ''].join('\r\n'),
        );
      },
    );

    let data = '';

    socket.setEncoding('utf8');
    socket.on('data', (chunk) => (data += chunk));
    socket.on('error', reject);
    socket.on('end', () => resolve(data.split('\r\n\r\n')[1] ?? ''));
  });
}

function requestH1(port, options = {}, body = undefined) {
  return new Promise((resolve, reject) => {
    const req = request1(
      {
        host: '127.0.0.1',
        port,
        path: '/',
        rejectUnauthorized: false,
        timeout: TIMEOUT,
        ...options,
      },
      (res) => {
        let data = '';

        res.setEncoding('utf8');
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            statusText: res.statusMessage,
            headers: res.headers,
            data,
          });
        });
      },
    );

    req.on('error', reject);
    req.end(body);
  });
}

describe('Exchange', () => {
  function describeTLS(context) {
    const certificate = Http2Https.useCertificate(context);

    Use.Response(context).body.data = JSON.stringify({
      servername: Http2Https.useServername(context),
      cipher: Http2Https.useCipher(context),
      alpn: Http2Https.useAlpnProtocol(context),
      subject: certificate.subject ?? null,
      authorization: Http2Https.useAuthorization(context),
    });
  }

  describe('>http2 client', () => {
    it('should answer with the protocol and the version', async () => {
      const app = await serve((context) => {
        const exchange = Use.Exchange(context);

        Use.Response(context).body.data = [
          exchange.protocol,
          exchange.httpVersion,
        ].join(' ');
      });

      try {
        const res = await requestH2(app.port);

        assert.equal(res.status, 200);
        assert.equal(res.data, 'https: 2.0');
      } finally {
        await app.close();
      }
    });

    it('should read the body through the distributor', async () => {
      const app = await serve(async (context) => {
        const chunks = [];

        for await (const chunk of Use.Request(context).body.data) {
          chunks.push(chunk);
        }

        Use.Response(context).body.data = Buffer.concat(chunks)
          .toString('utf8')
          .toUpperCase();
      });

      try {
        const res = await requestH2(app.port, { ':method': 'POST' }, 'h2 body');

        assert.equal(res.data, 'H2 BODY');
      } finally {
        await app.close();
      }
    });

    it('should keep the distributor path when inspecting', async () => {
      const app = await serve(async (context) => {
        const peeked = Http2Https.inspectHttp2Stream(context);
        const chunks = [];

        for await (const chunk of Use.Request(context).body.data) {
          chunks.push(chunk);
        }

        Use.Response(context).body.data = [
          peeked.id,
          Buffer.concat(chunks).toString('utf8'),
        ].join(' ');
      });

      try {
        const res = await requestH2(app.port, { ':method': 'POST' }, 'intact');

        assert.match(res.data, /^\d+ intact$/);
      } finally {
        await app.close();
      }
    });

    it('should hand over the raw stream', async () => {
      const app = await serve(async (context) => {
        const chunks = [];

        for await (const chunk of Http2Https.useHttp2Stream(context)) {
          chunks.push(chunk);
        }

        Use.Response(context).body.data = Buffer.concat(chunks)
          .toString('utf8')
          .toUpperCase();
      });

      try {
        const res = await requestH2(
          app.port,
          { ':method': 'POST' },
          'raw h2 body',
        );

        assert.equal(res.data, 'RAW H2 BODY');
      } finally {
        await app.close();
      }
    });

    it('should reject the raw request on the http/2 exchange', async () => {
      const app = await serve((context) => {
        let message = 'no error';

        try {
          Http2Https.useHttp1Request(context);
        } catch (error) {
          message = error.message;
        }

        Use.Response(context).body.data = message;
      });

      try {
        const res = await requestH2(app.port);

        assert.match(res.data, /HTTP\/1\.x only/);
      } finally {
        await app.close();
      }
    });

    it('should read the TLS facts of the h2 session', async () => {
      const app = await serve(describeTLS);

      try {
        const res = await requestH2(app.port, {}, undefined, {
          servername: 'kitty.test',
        });
        const body = JSON.parse(res.data);

        assert.equal(body.servername, 'kitty.test');
        assert.equal(typeof body.cipher.name, 'string');
        assert.match(body.cipher.version, /^TLSv1\.[23]$/);
        assert.equal(body.alpn, 'h2');
        assert.deepEqual(body.subject, null);
        assert.deepEqual(body.authorization, {
          authorized: false,
          error: null,
        });
      } finally {
        await app.close();
      }
    });

    it('should read the client certificate presented on the h2 session', async () => {
      const app = await serve(describeTLS, {
        requestCert: true,
        rejectUnauthorized: false,
      });

      try {
        const res = await requestH2(app.port, {}, undefined, {
          servername: 'kitty.test',
          key: credentials.key,
          cert: credentials.cert,
        });
        const body = JSON.parse(res.data);

        assert.equal(body.subject.CN, 'localhost');
        assert.deepEqual(body.authorization, {
          authorized: false,
          error: 'DEPTH_ZERO_SELF_SIGNED_CERT',
        });
      } finally {
        await app.close();
      }
    });

    it('should end an empty response when the handler stays silent', async () => {
      const app = await serve(() => {});

      try {
        const res = await requestH2(app.port);

        assert.equal(res.status, 200);
        assert.equal(res.data, '');
      } finally {
        await app.close();
      }
    });
  });

  describe('>http/1.1 client', () => {
    it('should answer with the protocol and the version', async () => {
      const app = await serve((context) => {
        const exchange = Use.Exchange(context);

        Use.Response(context).body.data = [
          exchange.protocol,
          exchange.httpVersion,
        ].join(' ');
      });

      try {
        const res = await requestH1(app.port);

        assert.equal(res.status, 200);
        assert.equal(res.data, 'https: 1.1');
      } finally {
        await app.close();
      }
    });

    it('should read the body through the distributor', async () => {
      const app = await serve(async (context) => {
        const chunks = [];

        for await (const chunk of Use.Request(context).body.data) {
          chunks.push(chunk);
        }

        Use.Response(context).body.data = Buffer.concat(chunks)
          .toString('utf8')
          .toUpperCase();
      });

      try {
        const res = await requestH1(
          app.port,
          { method: 'POST', headers: { 'content-type': 'text/plain' } },
          'h1 body',
        );

        assert.equal(res.data, 'H1 BODY');
      } finally {
        await app.close();
      }
    });

    it('should keep the distributor path when inspecting', async () => {
      const app = await serve(async (context) => {
        const peeked = Http2Https.inspectHttp1Request(context);
        const chunks = [];

        for await (const chunk of Use.Request(context).body.data) {
          chunks.push(chunk);
        }

        Use.Response(context).body.data = [
          peeked.method,
          Buffer.concat(chunks).toString('utf8'),
        ].join(' ');
      });

      try {
        const res = await requestH1(
          app.port,
          { method: 'POST', headers: { 'content-type': 'text/plain' } },
          'intact',
        );

        assert.equal(res.data, 'POST intact');
      } finally {
        await app.close();
      }
    });

    it('should hand over the raw request', async () => {
      const app = await serve(async (context) => {
        const chunks = [];

        for await (const chunk of Http2Https.useHttp1Request(context)) {
          chunks.push(chunk);
        }

        Use.Response(context).body.data = Buffer.concat(chunks)
          .toString('utf8')
          .toUpperCase();
      });

      try {
        const res = await requestH1(
          app.port,
          { method: 'POST', headers: { 'content-type': 'text/plain' } },
          'raw h1 body',
        );

        assert.equal(res.data, 'RAW H1 BODY');
      } finally {
        await app.close();
      }
    });

    it('should hand over the raw request of an http/1.0 client', async () => {
      const app = await serve((context) => {
        Use.Response(context).body.data =
          Http2Https.useHttp1Request(context).httpVersion;
      });

      try {
        assert.equal(await requestHttp10(app.port), '1.0');
      } finally {
        await app.close();
      }
    });

    it('should reject the raw stream on the http/1.1 exchange', async () => {
      const app = await serve((context) => {
        let message = 'no error';

        try {
          Http2Https.useHttp2Stream(context);
        } catch (error) {
          message = error.message;
        }

        Use.Response(context).body.data = message;
      });

      try {
        const res = await requestH1(app.port);

        assert.match(res.data, /HTTP\/2 only/);
      } finally {
        await app.close();
      }
    });

    it('should read the TLS facts of the http/1.1 exchange', async () => {
      const app = await serve(describeTLS);

      try {
        const res = await requestH1(app.port, { servername: 'kitty.test' });
        const body = JSON.parse(res.data);

        assert.equal(body.servername, 'kitty.test');
        assert.equal(typeof body.cipher.name, 'string');
        assert.match(body.cipher.version, /^TLSv1\.[23]$/);
        assert.equal(body.alpn, false);
        assert.deepEqual(body.subject, null);
        assert.deepEqual(body.authorization, {
          authorized: false,
          error: null,
        });
      } finally {
        await app.close();
      }
    });

    it('should end an empty response when the handler stays silent', async () => {
      const app = await serve(() => {});

      try {
        const res = await requestH1(app.port);

        assert.equal(res.status, 200);
        assert.equal(res.data, '');
      } finally {
        await app.close();
      }
    });
  });

  describe('>both clients', () => {
    it('should apply the status and the headers set by the handler', async () => {
      const app = await serve((context) => {
        const exchange = Use.Exchange(context);
        const response = Use.Response(context);

        exchange.setStatus(202, 'Accepted');
        response.header.set('x-plain', 'plain');
        response.body.data = 'ok';
      });

      try {
        const res2 = await requestH2(app.port);
        const res1 = await requestH1(app.port);

        for (const res of [res2, res1]) {
          assert.equal(res.status, 202);
          assert.equal(res.headers['x-plain'], 'plain');
          assert.equal(res.data, 'ok');
        }

        assert.equal(res2.headers[':status'], 202);
      } finally {
        await app.close();
      }
    });

    it('should keep the status text for the http/1.1 client only', async () => {
      const app = await serve((context) => {
        const exchange = Use.Exchange(context);
        let text;

        exchange.setStatus(202, 'Accepted');

        try {
          text = exchange.response.statusText;
        } catch (error) {
          text = error.message;
        }

        Use.Response(context).body.data = text;
      });

      try {
        const res2 = await requestH2(app.port);
        const res1 = await requestH1(app.port);

        assert.match(res2.data, /status text is HTTP\/1\.x only/);
        assert.equal(res2.headers[':status'], 202);
        assert.equal(res1.status, 202);
        assert.equal(res1.statusText, 'Accepted');
        assert.equal(res1.data, 'Accepted');
      } finally {
        await app.close();
      }
    });
  });

  describe('Use.Server()', () => {
    it('should answer the deployed server', async () => {
      const app = await serve((context) => {
        const server = Http2Https.useServer(context);

        Use.Response(context).body.data = String(server.listening);
      });

      try {
        const res = await requestH1(app.port);

        assert.equal(res.data, 'true');
      } finally {
        await app.close();
      }
    });

    it('should reject a plain http server', async () => {
      const workflow = createWorkflow((context) => {
        let message = 'no error';

        try {
          Http2Https.useServer(context);
        } catch (error) {
          message = error.message;
        }

        Use.Response(context).body.data = message;
      });
      const server = createServer();

      await workflow
        .withDeployer(Http1Http.Deployer.Http1HttpDeployer)
        .deploy(server);
      await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

      const { port } = server.address();

      try {
        const res = await fetch(`http://127.0.0.1:${port}/`);

        assert.match(await res.text(), /NOT http2\.Http2SecureServer/);
      } finally {
        await new Promise((resolve) => server.close(resolve));
      }
    });
  });
});
