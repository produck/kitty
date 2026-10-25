import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Baseline from '../Baseline/index.mjs';

function createSocket() {
  return { readyState: 1, sent: [], closed: null };
}

async function dispatchWithSocket() {
  const internal = { socket: createSocket() };
  const state = await Baseline.dispatch({ kind: 'websocket', internal });

  return { state, socket: state.internal.socket };
}

describe('WebSocketController', () => {
  describe('.readyState', () => {
    it('should read the ready state of the socket', async () => {
      const { state, socket } = await dispatchWithSocket();

      socket.readyState = 3;

      assert.equal(state.exchange.controller.readyState, 3);
    });
  });

  describe('.send()', () => {
    it('should write a payload to the socket', async () => {
      const { state, socket } = await dispatchWithSocket();

      state.exchange.controller.send('probe');

      assert.deepEqual(socket.sent, ['probe']);
    });

    it('should reject a payload outside the allowed types', async () => {
      const { state } = await dispatchWithSocket();

      assert.throws(() => state.exchange.controller.send(1));
    });
  });

  describe('.close()', () => {
    it('should close the socket with a code and a reason', async () => {
      const { state, socket } = await dispatchWithSocket();

      state.exchange.controller.close(1000, 'done');

      assert.deepEqual(socket.closed, { code: 1000, reason: 'done' });
    });
  });
});
