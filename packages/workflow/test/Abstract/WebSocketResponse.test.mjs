import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Baseline from '../Baseline/index.mjs';

function dispatchResponse(patch = {}) {
  return Baseline.dispatch({
    kind: 'websocket',
    internal: {
      socket: { readyState: 1, sent: [], closed: null },
      ...patch,
    },
  });
}

describe('WebSocketResponse', () => {
  describe('.isFinished', () => {
    it('should always report a finished response', async () => {
      const state = await dispatchResponse({ finished: false });

      assert.equal(state.response.isFinished, true);
    });
  });

  describe('.statusCode', () => {
    it('should read the handshake status', async () => {
      const state = await dispatchResponse({ status: 101 });

      assert.equal(state.response.statusCode, 101);
    });
  });

  describe('.header', () => {
    it('should expose the handshake header part', async () => {
      const state = await dispatchResponse({
        responseHeaders: new Map([['sec-websocket-accept', 'probe']]),
      });

      assert.equal(state.response.header.get('sec-websocket-accept'), 'probe');
      assert.equal(state.response.header.set, undefined);
    });
  });
});
