import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Baseline from '../Baseline/index.mjs';

function createSocket() {
  return { readyState: 1, sent: [], closed: null };
}

async function dispatchPending() {
  const internal = { socket: createSocket() };
  const state = await Baseline.dispatch({ kind: 'websocket', internal });

  return { state, socket: state.internal.socket };
}

async function dispatchWithSocket() {
  const { state, socket } = await dispatchPending();

  state.exchange.controller.upgrade();

  return { state, socket };
}

describe('WebSocketController', () => {
  describe('.upgrade()', () => {
    it('should complete the handshake on the connection', async () => {
      const { state } = await dispatchPending();

      assert.equal(state.internal.upgraded, undefined);

      state.exchange.controller.upgrade();

      assert.equal(state.internal.upgraded, true);
    });

    it('should reject a second upgrade', async () => {
      const { state } = await dispatchWithSocket();

      assert.throws(() => state.exchange.controller.upgrade());
    });
  });

  describe('.readyState', () => {
    it('should reject before the handshake', async () => {
      const { state } = await dispatchPending();

      assert.throws(() => state.exchange.controller.readyState);
    });

    it('should read the ready state of the socket', async () => {
      const { state, socket } = await dispatchWithSocket();

      socket.readyState = 3;

      assert.equal(state.exchange.controller.readyState, 3);
    });

    it('should reject a ready state outside the WebSocket states', async () => {
      const { state, socket } = await dispatchWithSocket();

      socket.readyState = 9;

      assert.throws(() => state.exchange.controller.readyState);
    });
  });

  describe('.send()', () => {
    it('should reject before the handshake', async () => {
      const { state } = await dispatchPending();

      assert.throws(() => state.exchange.controller.send('probe'));
    });

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
    it('should reject before the handshake', async () => {
      const { state } = await dispatchPending();

      assert.throws(() => state.exchange.controller.close(1000, 'done'));
    });

    it('should close the socket with a code and a reason', async () => {
      const { state, socket } = await dispatchWithSocket();

      state.exchange.controller.close(1000, 'done');

      assert.deepEqual(socket.closed, { code: 1000, reason: 'done' });
    });

    it('should dispatch the close event', async () => {
      const { state } = await dispatchWithSocket();
      const received = [];

      state.exchange.controller.addEventListener('close', (event) => {
        received.push(event);
      });
      state.exchange.controller.close(1000, 'done');

      assert.equal(received.length, 1);

      const [event] = received;

      assert.ok(event instanceof Baseline.Kitty.WebSocketControllerEvent.Close);
      assert.equal(
        event.type,
        Baseline.Kitty.WebSocketControllerEvent.TYPE.CLOSE,
      );
      assert.equal(event.code, 1000);
      assert.equal(event.reason, 'done');
    });
  });
});
