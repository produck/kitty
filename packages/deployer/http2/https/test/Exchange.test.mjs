import * as http2 from 'node:http2';
import { request as request1 } from 'node:https';
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

async function serve(handler) {
  const workflow = createWorkflow(handler);
  const server = http2.createSecureServer({ ...credentials, allowHTTP1: true });
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

function requestH2(port, headers = {}, body = undefined) {
  return new Promise((resolve, reject) => {
    const client = http2.connect(`https://127.0.0.1:${port}`, {
      rejectUnauthorized: false,
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
  describe('>http2 client', () => {
    it('should answer with the protocol and the version', async () => {
      const app = await serve((context) => {
        const exchange = useExchange(context);

        useResponse(context).body.data = [
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

        for await (const chunk of useRequest(context).body.data) {
          chunks.push(chunk);
        }

        useResponse(context).body.data = Buffer.concat(chunks)
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
  });

  describe('>http/1.1 client', () => {
    it('should answer with the protocol and the version', async () => {
      const app = await serve((context) => {
        const exchange = useExchange(context);

        useResponse(context).body.data = [
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

        for await (const chunk of useRequest(context).body.data) {
          chunks.push(chunk);
        }

        useResponse(context).body.data = Buffer.concat(chunks)
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
        const exchange = useExchange(context);
        const response = useResponse(context);

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
  });
});
