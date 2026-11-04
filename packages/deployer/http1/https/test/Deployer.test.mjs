import * as https from 'node:https';
import { Readable } from 'node:stream';

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Kit from '@produck/kit';
import {
  Abstract,
  SYMBOL,
  useExchange,
  useRequest,
  useResponse,
} from '@produck/kitty-workflow';

import * as Http1Https from '@produck/kitty-deployer-http1-https';
import { Exchange as WebSocketExchange } from '@produck/kitty-deployer-http1-http/exchange/websocket';

import credentials from './credentials.mjs';
import Distributor from './Distributor.mjs';

const Deployer = Http1Https.Deployer.Http1HttpsDeployer;

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
  workflow.use(handler);

  return workflow.finalize();
}

async function serve(handler, options = {}) {
  const { compile = false, tls = {} } = options;
  const workflow = createWorkflow(handler);
  const server = https.createServer({ ...credentials, ...tls });
  const oneTime = workflow.withDeployer(Deployer);
  let manifest = null;

  if (compile) {
    const deployment = await oneTime.compile(server);

    manifest = deployment.manifest;
    server.on('request', manifest['request-listener']);
  } else {
    await oneTime.deploy(server);
  }

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

  const { port } = server.address();

  return {
    manifest,
    port,
    origin: `https://127.0.0.1:${port}`,
    close() {
      server.closeAllConnections();

      return new Promise((resolve) => server.close(resolve));
    },
  };
}

const TIMEOUT = 3000;

function request(url, init) {
  return fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT) });
}

function askTLS(port, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        host: '127.0.0.1',
        port,
        rejectUnauthorized: false,
        timeout: TIMEOUT,
        ...options,
      },
      (res) => {
        let body = '';

        res.setEncoding('utf8');
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => resolve(body));
      },
    );

    req.on('error', reject);
    req.end();
  });
}

describe('Deployer', () => {
  describe('::TAG', () => {
    it('should be a non-empty string', () => {
      const tag = Deployer[SYMBOL.DEPLOYER._S.TAG];

      assert.equal(typeof tag, 'string');
      assert.notEqual(tag.length, 0);
    });
  });

  describe('::SERVER_CTOR', () => {
    it('should target the TLS https server', () => {
      const Server = Deployer[SYMBOL.DEPLOYER._S.SERVER_CTOR];

      assert.equal(Server, https.Server);
    });
  });

  describe('::EXCHANGE_CTOR.HTTP', () => {
    it('should expose a subclass of the abstract http exchange', () => {
      const Exchange = Deployer[SYMBOL.DEPLOYER._S.EXCHANGE_CTOR.HTTP];

      assert.ok(Exchange.prototype instanceof Abstract.HttpExchange);
    });
  });

  describe('::EXCHANGE_CTOR.WEB_SOCKET', () => {
    it('should serve no websocket', () => {
      const WebSocket = Deployer[SYMBOL.DEPLOYER._S.EXCHANGE_CTOR.WEB_SOCKET];

      assert.equal(WebSocket, undefined);
    });
  });
});

describe('Exchange', () => {
  describe('.response.body', () => {
    it('should answer over a real TLS connection', async () => {
      const app = await serve((context) => {
        useResponse(context).body.data = 'secure';
      });

      try {
        const res = await request(`${app.origin}/hello`);

        assert.equal(res.status, 200);
        assert.equal(res.headers.get('content-length'), '6');
        assert.equal(await res.text(), 'secure');
      } finally {
        await app.close();
      }
    });
  });

  describe('connection facts', () => {
    it('should expose the https server and the protocol', async () => {
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
        const res = await request(`${app.origin}/facts`);

        assert.equal(res.status, 202);
        assert.equal(await res.text(), 'Server https: 1.1');
      } finally {
        await app.close();
      }
    });

    it('should report the https protocol without the server providing one', async () => {
      const app = await serve((context) => {
        useResponse(context).body.data = useExchange(context).protocol;
      });

      try {
        const res = await request(`${app.origin}/protocol`);

        assert.equal(await res.text(), 'https:');
      } finally {
        await app.close();
      }
    });
  });

  describe('TLS facts', () => {
    function describeTLS(context) {
      const certificate = Http1Https.useCertificate(context);

      useResponse(context).body.data = JSON.stringify({
        servername: Http1Https.useServername(context),
        cipher: Http1Https.useCipher(context),
        alpn: Http1Https.useAlpnProtocol(context),
        subject: certificate.subject ?? null,
        authorization: Http1Https.useAuthorization(context),
      });
    }

    it('should read the SNI name, cipher, ALPN and an empty peer certificate', async () => {
      const app = await serve(describeTLS);

      try {
        const body = JSON.parse(
          await askTLS(app.port, { servername: 'kitty.test', path: '/' }),
        );

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

    it('should read the client certificate and its verification failure', async () => {
      const app = await serve(describeTLS, {
        tls: { requestCert: true, rejectUnauthorized: false },
      });

      try {
        const body = JSON.parse(
          await askTLS(app.port, {
            servername: 'kitty.test',
            path: '/',
            key: credentials.key,
            cert: credentials.cert,
          }),
        );

        assert.equal(body.subject.CN, 'localhost');
        assert.deepEqual(body.authorization, {
          authorized: false,
          error: 'DEPTH_ZERO_SELF_SIGNED_CERT',
        });
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
        const res = await request(`${app.origin}/header`);

        assert.equal(await res.text(), 'plain listed');
        assert.equal(res.headers.get('x-doomed'), null);
      } finally {
        await app.close();
      }
    });
  });

  describe('.request', () => {
    it('should read method, url and body', async () => {
      const app = await serve(async (context) => {
        const request = useRequest(context);
        const response = useResponse(context);
        const body = await new Response(request.body.data).text();

        response.body.data = [request.method, request.url.pathname, body].join(
          ' ',
        );
      });

      try {
        const res = await request(`${app.origin}/echo`, {
          body: 'payload',
          method: 'POST',
        });

        assert.equal(await res.text(), 'POST /echo payload');
      } finally {
        await app.close();
      }
    });

    it('should read a header and list the header names', async () => {
      const app = await serve((context) => {
        const request = useRequest(context);
        const response = useResponse(context);
        const absent = request.header.get('x-absent');
        const listed = [...request.header.keys()].includes('x-present');

        response.body.data = [
          absent === undefined ? 'absent' : 'present',
          request.header.get('x-present'),
          listed ? 'listed' : 'unlisted',
        ].join(' ');
      });

      try {
        const res = await request(`${app.origin}/header`, {
          headers: { 'x-present': 'value' },
        });

        assert.equal(await res.text(), 'absent value listed');
      } finally {
        await app.close();
      }
    });
  });

  describe('compile()', () => {
    it('should expose the request listener as manifest material', async () => {
      const app = await serve(
        (context) => {
          useResponse(context).body.data = 'compiled';
        },
        { compile: true },
      );

      try {
        assert.equal(typeof app.manifest['request-listener'], 'function');

        const res = await request(`${app.origin}/compiled`);

        assert.equal(await res.text(), 'compiled');
      } finally {
        await app.close();
      }
    });
  });
});

describe('::useHttp1Request()', () => {
  it('should answer the node request and keep the TLS facts', async () => {
    const app = await serve((context) => {
      const req = Http1Https.useHttp1Request(context);

      useResponse(context).body.data = [
        Http1Https.useServername(context),
        req.url,
      ].join(' ');
    });

    try {
      const body = await askTLS(app.port, {
        servername: 'kitty.test',
        path: '/raw',
      });

      assert.equal(body, 'kitty.test /raw');
    } finally {
      await app.close();
    }
  });
});

describe('::withWebSocketExchange()', () => {
  it('should derive a deployer that fills the websocket slot', () => {
    const Derived = Deployer.withWebSocketExchange(WebSocketExchange);

    assert.ok(Derived.prototype instanceof Deployer);
    assert.equal(
      Derived[SYMBOL.DEPLOYER._S.EXCHANGE_CTOR.WEB_SOCKET],
      WebSocketExchange,
    );
  });

  it('should tag the derived deployer as a websocket variant', () => {
    const base = Deployer[SYMBOL.DEPLOYER._S.TAG];
    const Derived = Deployer.withWebSocketExchange(WebSocketExchange);

    assert.equal(Derived[SYMBOL.DEPLOYER._S.TAG], `${base},websocket`);
  });

  it('should keep the TLS server constructor', () => {
    const Derived = Deployer.withWebSocketExchange(WebSocketExchange);

    assert.equal(Derived[SYMBOL.DEPLOYER._S.SERVER_CTOR], https.Server);
  });
});
