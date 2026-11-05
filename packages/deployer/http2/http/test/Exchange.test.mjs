import * as http from 'node:http';
import * as http2 from 'node:http2';
import { Readable } from 'node:stream';

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  Abstract,
  SYMBOL,
  useExchange,
  useRequest,
  useResponse,
} from '@produck/kitty-workflow';

import * as Kit from '@produck/kit';
import * as Http1Http from '@produck/kitty-deployer-http1-http';
import * as Http2Http from '@produck/kitty-deployer-http2-http';

import Distributor from './Distributor.mjs';

const Deployer = Http2Http.Deployer.Http2HttpDeployer;

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

async function serve(handler) {
  const workflow = createWorkflow(handler);
  const server = http2.createServer();
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

async function serveHttp1(handler) {
  const workflow = createWorkflow(handler);
  const server = http.createServer();

  await workflow
    .withDeployer(Http1Http.Deployer.Http1HttpDeployer)
    .deploy(server);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

  const { port } = server.address();

  return {
    origin: `http://127.0.0.1:${port}`,
    close() {
      server.closeAllConnections();

      return new Promise((resolve) => server.close(resolve));
    },
  };
}

function probeDistributor(context) {
  return useRequest(context).body.data;
}

function request(port, headers = {}, body = undefined) {
  return new Promise((resolve, reject) => {
    const client = http2.connect(`http://127.0.0.1:${port}`);
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

describe('Exchange', () => {
  describe('useServer()', () => {
    it('should answer the deployed server', async () => {
      const app = await serve((context) => {
        const server = Http2Http.useServer(context);

        useResponse(context).body.data = String(server.listening);
      });

      try {
        const res = await request(app.port);

        assert.equal(res.data, 'true');
      } finally {
        await app.close();
      }
    });

    it('should reject a server that is not an http2 server', async () => {
      const app = await serveHttp1((context) => {
        let message = 'no error';

        try {
          Http2Http.useServer(context);
        } catch (error) {
          message = error.message;
        }

        useResponse(context).body.data = message;
      });

      try {
        const res = await fetch(app.origin);

        assert.match(await res.text(), /NOT http2\.Http2Server/);
      } finally {
        await app.close();
      }
    });
  });

  describe('.response.body', () => {
    it('should answer over a real h2 connection', async () => {
      const app = await serve((context) => {
        useResponse(context).body.data = 'h2c';
      });

      try {
        const res = await request(app.port);

        assert.equal(res.status, 200);
        assert.equal(res.headers['content-length'], '3');
        assert.equal(res.data, 'h2c');
      } finally {
        await app.close();
      }
    });

    it('should end an empty response when the handler stays silent', async () => {
      const app = await serve(() => {});

      try {
        const res = await request(app.port);

        assert.equal(res.status, 200);
        assert.equal(res.data, '');
      } finally {
        await app.close();
      }
    });

    it('should end a response that carries no body', async () => {
      const app = await serve((context) => {
        const response = useResponse(context);

        response.header.set('x-quiet', '1');
        response.body.data = null;
      });

      try {
        const res = await request(app.port);

        assert.equal(res.status, 200);
        assert.equal(res.headers['x-quiet'], '1');
        assert.equal(res.data, '');
      } finally {
        await app.close();
      }
    });
  });

  describe('connection facts', () => {
    it('should expose the server, the protocol and the version', async () => {
      const app = await serve((context) => {
        const exchange = useExchange(context);
        const response = useResponse(context);

        exchange.setStatus(202, 'Accepted');

        response.body.data = [
          exchange.server.constructor.name,
          exchange.protocol,
          exchange.httpVersion,
        ].join(' ');
      });

      try {
        const res = await request(app.port);

        assert.equal(res.status, 202);
        assert.match(res.data, /^Http2Server http: 2\.0$/);
      } finally {
        await app.close();
      }
    });
  });

  describe('.response.state', () => {
    it('should report the status and the finished flag', async () => {
      const app = await serve((context) => {
        const exchange = useExchange(context);
        const response = exchange.response;

        exchange.setStatus(201, 'Created');
        useResponse(context).body.data = [
          response.statusCode,
          response.isFinished,
        ].join(' ');
      });

      try {
        const res = await request(app.port);

        assert.equal(res.status, 201);
        assert.equal(res.data, '201 false');
      } finally {
        await app.close();
      }
    });

    it('should refuse to read the status text', async () => {
      const app = await serve((context) => {
        let message;

        try {
          message = useExchange(context).response.statusText;
        } catch (error) {
          message = error.message;
        }

        useResponse(context).body.data = message;
      });

      try {
        const res = await request(app.port);

        assert.match(res.data, /status text is HTTP\/1\.x only/);
      } finally {
        await app.close();
      }
    });
  });

  describe('.request', () => {
    it('should read the method, the path and a header', async () => {
      const app = await serve((context) => {
        const request = useRequest(context);
        const { pathname, search } = request.url;

        useResponse(context).body.data = [
          request.method,
          pathname + search,
          request.header.get('x-probe'),
        ].join(' ');
      });

      try {
        const res = await request(app.port, {
          ':method': 'POST',
          ':path': '/facts?probe=1',
          'x-probe': 'yes',
        });

        assert.equal(res.data, 'POST /facts?probe=1 yes');
      } finally {
        await app.close();
      }
    });

    it('should list the header names without pseudo headers', async () => {
      const app = await serve((context) => {
        useResponse(context).body.data = [
          ...useRequest(context).header.keys(),
        ].join(',');
      });

      try {
        const res = await request(app.port, { 'x-one': '1', 'x-two': '2' });

        assert.equal(res.data, 'x-one,x-two');
      } finally {
        await app.close();
      }
    });

    it('should answer an absent header as undefined', async () => {
      const app = await serve((context) => {
        useResponse(context).body.data = String(
          useRequest(context).header.get('x-absent'),
        );
      });

      try {
        const res = await request(app.port);

        assert.equal(res.data, 'undefined');
      } finally {
        await app.close();
      }
    });

    it('should read the body through the distributor', async () => {
      const app = await serve(async (context) => {
        const chunks = [];

        for await (const chunk of useRequest(context).body.data) {
          chunks.push(chunk);
        }

        useResponse(context).body.data = Buffer.concat(chunks)
          .toString('utf8')
          .toUpperCase();
      });

      try {
        const res = await request(
          app.port,
          { ':method': 'POST' },
          'hello body',
        );

        assert.equal(res.data, 'HELLO BODY');
      } finally {
        await app.close();
      }
    });
  });

  describe('::useHttp2Stream()', () => {
    it('should keep the distributor path when inspecting', async () => {
      const app = await serve(async (context) => {
        const peeked = Http2Http.inspectHttp2Stream(context);
        const chunks = [];

        for await (const chunk of useRequest(context).body.data) {
          chunks.push(chunk);
        }

        useResponse(context).body.data = [
          peeked.id,
          Buffer.concat(chunks).toString(),
        ].join(' ');
      });

      try {
        const res = await request(app.port, { ':method': 'POST' }, 'intact');

        assert.match(res.data, /^\d+ intact$/);
      } finally {
        await app.close();
      }
    });

    it('should refuse an exchange without a bound stream', async () => {
      const app = await serveHttp1((context) => {
        let message = 'no error';

        try {
          Http2Http.useHttp2Stream(context);
        } catch (error) {
          message = error.message;
        }

        useResponse(context).body.data = message;
      });

      try {
        const res = await fetch(app.origin);

        assert.match(await res.text(), /No raw stream is bound/);
      } finally {
        await app.close();
      }
    });

    it('should hand over the node stream and block the distributor path', async () => {
      const app = await serve(async (context) => {
        const chunks = [];

        for await (const chunk of Http2Http.useHttp2Stream(context)) {
          chunks.push(chunk);
        }

        let bodyState = 'open';

        try {
          probeDistributor(context);
        } catch {
          bodyState = 'blocked';
        }

        useResponse(context).body.data = [
          Buffer.concat(chunks).toString('utf8'),
          bodyState,
        ].join(' ');
      });

      try {
        const res = await request(app.port, { ':method': 'POST' }, 'raw body');

        assert.equal(res.data, 'raw body blocked');
      } finally {
        await app.close();
      }
    });
  });

  describe('.response.header', () => {
    it('should set, read and delete a header', async () => {
      const app = await serve((context) => {
        const response = useResponse(context);

        response.header.set('x-plain', 'plain');
        const plain = response.header.get('x-plain');
        const listed = [...response.header.keys()].includes('x-plain');

        response.header.set('x-doomed', '1');
        response.header.delete('x-doomed');

        response.body.data = [plain, listed ? 'listed' : 'unlisted'].join(' ');
      });

      try {
        const res = await request(app.port);

        assert.equal(res.data, 'plain listed');
        assert.equal(res.headers['x-plain'], 'plain');
        assert.equal(res.headers['x-doomed'], undefined);
      } finally {
        await app.close();
      }
    });
  });
});
