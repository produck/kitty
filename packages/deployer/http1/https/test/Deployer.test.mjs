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
  const { compile = false, protocol = true } = options;
  const workflow = createWorkflow(handler);
  const server = https.createServer(credentials);
  const oneTime = workflow.withDeployer(Deployer);
  let manifest = null;

  if (protocol) {
    server.protocol = 'https:';
  }

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

    it('should fall back to the http protocol when the server stays silent', async () => {
      const app = await serve(
        (context) => {
          useResponse(context).body.data = useExchange(context).protocol;
        },
        { protocol: false },
      );

      try {
        const res = await request(`${app.origin}/protocol`);

        assert.equal(await res.text(), 'http:');
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
