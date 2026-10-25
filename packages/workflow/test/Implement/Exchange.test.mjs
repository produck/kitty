import * as net from 'node:net';
import { Readable } from 'node:stream';

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Baseline from '../Baseline/index.mjs';

const { Abstract, SYMBOL } = Baseline.Kitty;
const noop = () => {};

function createBaseOptions() {
  return {
    identity: { get: () => ({}) },
    server: {
      get: () => new net.Server(),
      protocol: { get: () => 'http:' },
    },
    httpVersion: { get: () => '1.1' },
    request: {
      method: { get: () => 'GET' },
      URL: { get: () => 'http://baseline.test/' },
      header: { get: () => undefined, keys: () => [] },
    },
  };
}

function createHttpOptions(patch = {}) {
  const options = createBaseOptions();

  options.request = {
    ...options.request,
    body: { source: { get: () => Readable.from([]) } },
  };
  options.response = {
    status: { get: () => 200, set: noop },
    statusText: { get: () => 'OK', set: noop },
    finished: { is: () => false },
    header: { get: () => undefined, keys: () => [], set: noop, delete: noop },
    body: { data: { set: noop } },
  };

  return { ...options, ...patch };
}

function createWebSocketOptions(patch = {}) {
  const options = createBaseOptions();

  options.response = {
    status: { get: () => 101 },
    statusText: { get: () => 'Switching Protocols' },
    finished: { is: () => false },
    header: { get: () => undefined, keys: () => [] },
  };
  options.controller = {
    readyState: { get: () => 1 },
    send: { send: noop },
    close: { close: noop },
  };

  return { ...options, ...patch };
}

describe('Http()', () => {
  describe('contract', () => {
    it('should require the identity option', () => {
      assert.throws(() =>
        Baseline.Kitty.Implement.Exchange.Http(
          createHttpOptions({ identity: undefined }),
        ),
      );
    });

    it('should require the server option', () => {
      assert.throws(() =>
        Baseline.Kitty.Implement.Exchange.Http(
          createHttpOptions({ server: undefined }),
        ),
      );
    });

    it('should require the http version option', () => {
      assert.throws(() =>
        Baseline.Kitty.Implement.Exchange.Http(
          createHttpOptions({ httpVersion: undefined }),
        ),
      );
    });

    it('should require the request option', () => {
      assert.throws(() =>
        Baseline.Kitty.Implement.Exchange.Http(
          createHttpOptions({ request: undefined }),
        ),
      );
    });

    it('should require the response option', () => {
      assert.throws(() =>
        Baseline.Kitty.Implement.Exchange.Http(
          createHttpOptions({ response: undefined }),
        ),
      );
    });

    it('should require the request body source', () => {
      const options = createHttpOptions();

      delete options.request.body;

      assert.throws(() => Baseline.Kitty.Implement.Exchange.Http(options));
    });

    it('should require the mutable response setters', () => {
      const options = createHttpOptions();

      options.response.header = { get: () => undefined, keys: () => [] };

      assert.throws(() => Baseline.Kitty.Implement.Exchange.Http(options));
    });
  });

  describe('>class', () => {
    it('should derive from the http exchange abstraction', () => {
      const Exchange =
        Baseline.Kitty.Implement.Exchange.Http(createHttpOptions());

      assert.ok(Exchange.prototype instanceof Abstract.HttpExchange);
    });

    it('should declare the request and response constructor slots', () => {
      const Exchange =
        Baseline.Kitty.Implement.Exchange.Http(createHttpOptions());

      assert.ok(
        Exchange[SYMBOL.EXCHANGE._S.REQUEST_CTOR].prototype instanceof
          Abstract.ExchangeRequest,
      );
      assert.ok(
        Exchange[SYMBOL.EXCHANGE._S.RESPONSE_CTOR].prototype instanceof
          Abstract.ExchangeResponse,
      );
    });

    it('should derive the identity from the class without an instance', () => {
      const Exchange =
        Baseline.Kitty.Implement.Exchange.Http(createHttpOptions());

      assert.deepEqual(Exchange[SYMBOL.EXCHANGE._S.IDENTITY]({}), {});
    });
  });
});

describe('WebSocket()', () => {
  describe('contract', () => {
    it('should require the controller option', () => {
      assert.throws(() =>
        Baseline.Kitty.Implement.Exchange.WebSocket(
          createWebSocketOptions({ controller: undefined }),
        ),
      );
    });

    it('should require the ready state accessor', () => {
      const options = createWebSocketOptions();

      delete options.controller.readyState;

      assert.throws(() => Baseline.Kitty.Implement.Exchange.WebSocket(options));
    });

    it('should require the send accessor', () => {
      const options = createWebSocketOptions();

      delete options.controller.send;

      assert.throws(() => Baseline.Kitty.Implement.Exchange.WebSocket(options));
    });

    it('should require the close accessor', () => {
      const options = createWebSocketOptions();

      delete options.controller.close;

      assert.throws(() => Baseline.Kitty.Implement.Exchange.WebSocket(options));
    });

    it('should accept a read-only response', () => {
      const Exchange = Baseline.Kitty.Implement.Exchange.WebSocket(
        createWebSocketOptions(),
      );

      assert.equal(typeof Exchange, 'function');
    });
  });

  describe('>class', () => {
    it('should derive from the web socket exchange abstraction', () => {
      const Exchange = Baseline.Kitty.Implement.Exchange.WebSocket(
        createWebSocketOptions(),
      );

      assert.ok(Exchange.prototype instanceof Abstract.WebSocketExchange);
    });

    it('should declare the controller constructor slot', () => {
      const Exchange = Baseline.Kitty.Implement.Exchange.WebSocket(
        createWebSocketOptions(),
      );

      assert.ok(
        Exchange[SYMBOL.WEB_SOCKET_EXCHANGE._S.CONTROLLER_CTOR]
          .prototype instanceof Abstract.WebSocketController,
      );
    });
  });
});

function createState(Server) {
  return {
    identity: {},
    server: new Server(),
    protocol: 'http:',
    httpVersion: '1.1',
    method: 'POST',
    url: 'http://baseline.test/probe',
    requestHeaders: new Map([['x-probe', 'yes']]),
    responseHeaders: new Map(),
    status: 200,
    statusText: 'OK',
    finished: false,
    requestBody: Readable.from([]),
    responseBody: null,
    readyState: 1,
    sent: [],
    closed: null,
  };
}

function headerAccessors(map) {
  return {
    get: (_context, key) => map.get(key.toLowerCase()),
    keys: () => [...map.keys()],
  };
}

function createHttpAccessors(state) {
  return {
    identity: { get: () => state.identity },
    server: {
      get: () => state.server,
      protocol: { get: () => state.protocol },
    },
    httpVersion: { get: () => state.httpVersion },
    request: {
      method: { get: () => state.method },
      URL: { get: () => state.url },
      header: headerAccessors(state.requestHeaders),
      body: { source: { get: () => state.requestBody } },
    },
    response: {
      status: {
        get: () => state.status,
        set: (_context, value) => {
          state.status = value;
        },
      },
      statusText: {
        get: () => state.statusText,
        set: (_context, value) => {
          state.statusText = value;
        },
      },
      finished: { is: () => state.finished },
      header: {
        ...headerAccessors(state.responseHeaders),
        set: (_context, key, value) => {
          state.responseHeaders.set(key.toLowerCase(), value);
        },
        delete: (_context, key) => {
          state.responseHeaders.delete(key.toLowerCase());
        },
      },
      body: {
        data: {
          set: (_context, value) => {
            state.responseBody = value;
          },
        },
      },
    },
  };
}

function createWebSocketAccessors(state) {
  return {
    identity: { get: () => state.identity },
    server: {
      get: () => state.server,
      protocol: { get: () => state.protocol },
    },
    httpVersion: { get: () => state.httpVersion },
    request: {
      method: { get: () => 'GET' },
      URL: { get: () => state.url },
      header: headerAccessors(state.requestHeaders),
    },
    response: {
      status: { get: () => 101 },
      statusText: { get: () => 'Switching Protocols' },
      finished: { is: () => false },
      header: headerAccessors(state.responseHeaders),
    },
    controller: {
      readyState: { get: () => state.readyState },
      send: {
        send: (_context, data) => {
          state.sent.push(data);
        },
      },
      close: {
        close: (_context, code, reason) => {
          state.closed = { code, reason };
        },
      },
    },
  };
}

async function dispatchImplemented() {
  class ProbeServer extends net.Server {}

  const state = createState(ProbeServer);
  const http = Baseline.Kitty.Implement.Exchange.Http(
    createHttpAccessors(state),
  );
  const webSocket = Baseline.Kitty.Implement.Exchange.WebSocket(
    createWebSocketAccessors(state),
  );
  let kit = null;
  const Deployer = Baseline.Kitty.Implement.Deployer({
    name: 'implemented',
    server: ProbeServer,
    exchange: { http, webSocket },
    install: (port) => {
      kit = port;
      port.appendExchangeAttacher((ExchangeKit) => {
        state.exchange = Baseline.Kitty.useExchange(ExchangeKit);
      });
    },
  });

  Baseline.Kitty.DeployerRegistry.registerDeployer(Deployer);

  const workflow = Baseline.createWorkflow({
    normalize: (value) => ({
      stream: value.stream ?? null,
      length: value.length ?? 0,
    }),
  });

  workflow.finalize();
  await workflow.deploy(new ProbeServer());

  return { kit, state };
}

describe('implemented exchange', () => {
  describe('>http', () => {
    it('should drive every read accessor', async () => {
      const { kit, state } = await dispatchImplemented();

      await kit.handleHttpExchange({});

      assert.equal(state.exchange.method, state.method);
      assert.equal(state.exchange.url.href, state.url);
      assert.equal(state.exchange.statusCode, state.status);
      assert.equal(state.exchange.statusText, state.statusText);
      assert.equal(state.exchange.server, state.server);
      assert.equal(state.exchange.protocol, state.protocol);
      assert.equal(state.exchange.httpVersion, state.httpVersion);
      assert.equal(state.exchange.mode, 'http');
    });

    it('should drive the request header and body accessors', async () => {
      const { kit, state } = await dispatchImplemented();

      await kit.handleHttpExchange({});

      assert.equal(state.exchange.request.header.get('X-Probe'), 'yes');
      assert.deepEqual(state.exchange.request.header.keys(), ['x-probe']);
      assert.equal(typeof state.exchange.request.body.distributor, 'object');

      state.requestHeaders.set('x-late', '1');

      assert.equal(state.exchange.request.header.get('x-late'), '1');
    });

    it('should drive the response mutators', async () => {
      const { kit, state } = await dispatchImplemented();

      await kit.handleHttpExchange({});

      state.exchange.setStatus(201, 'Created');

      assert.equal(state.status, 201);
      assert.equal(state.statusText, 'Created');

      state.exchange.response.header.set('X-Probe', 'yes');

      assert.equal(state.responseHeaders.get('x-probe'), 'yes');
      assert.deepEqual(state.exchange.response.header.keys(), ['x-probe']);

      state.exchange.response.header.delete('x-probe');

      assert.deepEqual(state.exchange.response.header.keys(), []);

      const stream = new ReadableStream();

      state.exchange.response.body.data = { stream, length: 1 };

      assert.equal(state.responseBody.stream, stream);
      assert.equal(state.responseBody.length, 1);
      assert.equal(state.exchange.response.body.data.stream, stream);
    });
  });

  describe('>web socket', () => {
    it('should drive every read accessor', async () => {
      const { kit, state } = await dispatchImplemented();

      await kit.handleWebSocketExchange({});

      assert.equal(state.exchange.mode, 'websocket');
      assert.equal(state.exchange.method, 'GET');
      assert.equal(state.exchange.url.href, state.url);
      assert.equal(state.exchange.statusCode, 101);
      assert.equal(state.exchange.statusText, 'Switching Protocols');
      assert.equal(state.exchange.server, state.server);
      assert.equal(state.exchange.protocol, state.protocol);
      assert.equal(state.exchange.httpVersion, state.httpVersion);
      assert.equal(state.exchange.response.isFinished, true);
      assert.equal(state.exchange.request.header.get('X-Probe'), 'yes');
      assert.deepEqual(state.exchange.response.header.keys(), []);
    });

    it('should drive the controller accessors', async () => {
      const { kit, state } = await dispatchImplemented();

      await kit.handleWebSocketExchange({});

      assert.equal(state.exchange.controller.readyState, 1);

      state.exchange.controller.send('probe');

      assert.deepEqual(state.sent, ['probe']);

      state.exchange.controller.close(1000, 'done');

      assert.deepEqual(state.closed, { code: 1000, reason: 'done' });
    });
  });
});
