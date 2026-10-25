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
