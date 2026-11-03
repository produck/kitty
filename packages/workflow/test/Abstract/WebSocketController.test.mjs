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

  state.exchange.controller.acceptUpgrade();

  return { state, socket };
}

describe('WebSocketController', () => {
  describe('.upgraded', () => {
    it('should report false before the handshake', async () => {
      const { state } = await dispatchPending();

      assert.equal(state.exchange.controller.upgraded, false);
    });

    it('should report true after an accepted handshake', async () => {
      const { state } = await dispatchWithSocket();

      assert.equal(state.exchange.controller.upgraded, true);
    });

    it('should report false after a rejected handshake', async () => {
      const { state } = await dispatchPending();

      state.exchange.controller.rejectUpgrade(403);

      assert.equal(state.exchange.controller.upgraded, false);
    });
  });

  describe('.closed', () => {
    it('should expose one stable promise', async () => {
      const { state } = await dispatchWithSocket();

      assert.equal(
        state.exchange.controller.closed,
        state.exchange.controller.closed,
      );
    });

    it('should settle with the close code and reason', async () => {
      const { state } = await dispatchWithSocket();
      const controller = state.exchange.controller;

      state.internal.notifier.close(1000, 'bye');

      assert.deepEqual(await controller.closed, { code: 1000, reason: 'bye' });
    });

    it('should settle after the local close', async () => {
      const { state } = await dispatchWithSocket();
      const controller = state.exchange.controller;

      controller.close(1001, 'leaving');

      assert.deepEqual(await controller.closed, {
        code: 1001,
        reason: 'leaving',
      });
    });

    it('should settle with a null code on a rejected handshake', async () => {
      const { state } = await dispatchPending();
      const controller = state.exchange.controller;

      controller.rejectUpgrade(403, 'Nope');

      assert.deepEqual(await controller.closed, {
        code: null,
        reason: 'handshake rejected',
      });
    });
  });

  describe('.acceptUpgrade()', () => {
    it('should complete the handshake on the connection', async () => {
      const { state } = await dispatchPending();

      assert.equal(state.internal.upgraded, undefined);

      state.exchange.controller.acceptUpgrade();

      assert.equal(state.internal.upgraded, true);
    });

    it('should reject a second upgrade', async () => {
      const { state } = await dispatchWithSocket();

      assert.throws(() => state.exchange.controller.acceptUpgrade());
    });
  });

  describe('.rejectUpgrade()', () => {
    it('should default to the bad request status and its phrase', async () => {
      const { state } = await dispatchPending();

      state.exchange.controller.rejectUpgrade();

      assert.deepEqual(state.internal.rejected, {
        status: 400,
        reason: 'Bad Request',
      });
    });

    it('should reject the handshake with a status and a reason', async () => {
      const { state } = await dispatchPending();

      state.exchange.controller.rejectUpgrade(403, 'Nope');

      assert.deepEqual(state.internal.rejected, {
        status: 403,
        reason: 'Nope',
      });
    });

    it('should default the reason to the standard phrase', async () => {
      const { state } = await dispatchPending();

      state.exchange.controller.rejectUpgrade(403);

      assert.deepEqual(state.internal.rejected, {
        status: 403,
        reason: 'Forbidden',
      });
    });

    it('should reject a status outside the error range', async () => {
      const { state } = await dispatchPending();

      assert.throws(() => state.exchange.controller.rejectUpgrade(200));
      assert.throws(() => state.exchange.controller.rejectUpgrade(42));
      assert.throws(() => state.exchange.controller.rejectUpgrade(700));
    });

    it('should reject a reason phrase with a line break', async () => {
      const { state } = await dispatchPending();

      assert.throws(() =>
        state.exchange.controller.rejectUpgrade(403, 'Nope\r\nX: y'),
      );
    });

    it('should reject a rejected connection', async () => {
      const { state } = await dispatchPending();

      state.exchange.controller.rejectUpgrade(403);

      assert.throws(() => state.exchange.controller.rejectUpgrade(403));
      assert.throws(() => state.exchange.controller.acceptUpgrade());
    });

    it('should reject an upgraded connection', async () => {
      const { state } = await dispatchWithSocket();

      assert.throws(() => state.exchange.controller.rejectUpgrade(403));
    });

    it('should keep the socket accessors unavailable after a rejection', async () => {
      const { state } = await dispatchPending();
      const controller = state.exchange.controller;

      controller.rejectUpgrade(403);

      assert.throws(() => controller.readyState, /rejected/);
      assert.throws(() => controller.send('probe'), /rejected/);
      assert.throws(() => controller.close(1000, 'done'), /rejected/);
    });
  });

  describe('.readyState', () => {
    it('should reject before the handshake', async () => {
      const { state } = await dispatchPending();

      assert.throws(() => state.exchange.controller.readyState, /not been/);
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

      assert.throws(() => state.exchange.controller.send('probe'), /not been/);
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

      assert.throws(
        () => state.exchange.controller.close(1000, 'done'),
        /not been/,
      );
    });

    it('should accept an empty close frame', async () => {
      const { state, socket } = await dispatchWithSocket();

      state.exchange.controller.close();

      assert.deepEqual(socket.closed, {
        code: undefined,
        reason: undefined,
      });
    });

    it('should accept a registered close code', async () => {
      const { state, socket } = await dispatchWithSocket();

      state.exchange.controller.close(4000, 'app');

      assert.deepEqual(socket.closed, { code: 4000, reason: 'app' });
    });

    it('should reject a close code outside the sendable ranges', async () => {
      const { state } = await dispatchWithSocket();
      const controller = state.exchange.controller;

      for (const code of [999, 1004, 1005, 1006, 1015, 2000, 2999, 5000]) {
        assert.throws(() => controller.close(code), String(code));
      }
    });

    it('should reject a reason longer than 123 bytes', async () => {
      const { state } = await dispatchWithSocket();
      const controller = state.exchange.controller;

      assert.throws(() => controller.close(1000, 'x'.repeat(124)));

      controller.close(1000, 'x'.repeat(123));
    });

    it('should reject a reason that is not a string', async () => {
      const { state } = await dispatchWithSocket();

      assert.throws(() => state.exchange.controller.close(1000, 1));
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

  describe('>notifier', () => {
    it('should expose one stable listener per event', async () => {
      const { state } = await dispatchWithSocket();
      const notifier = state.internal.notifier;

      assert.equal(typeof notifier.message, 'function');
      assert.equal(typeof notifier.close, 'function');
      assert.equal(typeof notifier.error, 'function');
      assert.equal(notifier.message, notifier.message);
      assert.equal(notifier.close, notifier.close);
      assert.equal(notifier.error, notifier.error);
    });
  });

  describe('#message', () => {
    it('should dispatch the message event with the payload', async () => {
      const { state } = await dispatchWithSocket();
      const received = [];

      state.exchange.controller.addEventListener('message', (event) => {
        received.push(event);
      });
      state.internal.notifier.message('probe', false);

      assert.equal(received.length, 1);

      const [event] = received;

      assert.ok(
        event instanceof Baseline.Kitty.WebSocketControllerEvent.Message,
      );
      assert.equal(
        event.type,
        Baseline.Kitty.WebSocketControllerEvent.TYPE.MESSAGE,
      );
      assert.equal(event.data, 'probe');
      assert.equal(event.isBinary, false);
    });
  });

  describe('#error', () => {
    it('should dispatch the error event with the failure', async () => {
      const { state } = await dispatchWithSocket();
      const received = [];
      const error = new RangeError('probe');

      state.exchange.controller.addEventListener('error', (event) => {
        received.push(event);
      });
      state.internal.notifier.error(error);

      assert.equal(received.length, 1);
      assert.equal(received[0].error, error);
      assert.equal(
        received[0].type,
        Baseline.Kitty.WebSocketControllerEvent.TYPE.ERROR,
      );
    });
  });
});
