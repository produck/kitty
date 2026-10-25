import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Baseline from '../Baseline/index.mjs';

const socket = () => ({ readyState: 1, sent: [], closed: null });

describe('WebSocketExchange', () => {
  describe('.request', () => {
    it('should expose the handshake request part', async () => {
      const state = await Baseline.dispatch({
        kind: 'websocket',
        internal: { socket: socket(), method: 'GET' },
      });

      assert.equal(state.request.method, 'GET');
      assert.equal(typeof state.request.header, 'object');
    });
  });

  describe('.response', () => {
    it('should expose the web socket response part', async () => {
      const state = await Baseline.dispatch({
        kind: 'websocket',
        internal: { socket: socket() },
      });

      assert.equal(state.response.isFinished, true);
      assert.equal(typeof state.response.header, 'object');
    });
  });

  describe('>controller', () => {
    it('should attach the controller to the exchange kit', async () => {
      const state = await Baseline.dispatch({
        kind: 'websocket',
        internal: { socket: socket() },
      });

      assert.equal(typeof state.exchange.controller, 'object');
      assert.equal(
        Baseline.Kitty.useWebSocket(state.exchangeKit),
        state.exchange.controller,
      );
    });

    it('should let a handler read the controller through the capability accessor', async () => {
      const seen = [];
      const state = await Baseline.dispatch({
        kind: 'websocket',
        internal: { socket: socket() },
        setup: (current) => {
          seen.push(Baseline.Kitty.useWebSocket(current.exchangeKit));
        },
      });

      assert.equal(seen.length, 1);
      assert.equal(seen[0], state.exchange.controller);
    });
  });
});
