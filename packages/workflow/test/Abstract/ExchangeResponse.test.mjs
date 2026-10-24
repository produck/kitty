import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Baseline from '../Baseline/index.mjs';

describe('ExchangeResponse', () => {
  describe('.statusCode', () => {
    it('should read the status from the internal record', async () => {
      const state = await Baseline.dispatch({ internal: { status: 204 } });

      assert.equal(state.response.statusCode, 204);
    });
  });

  describe('.statusText', () => {
    it('should read the status text from the internal record', async () => {
      const state = await Baseline.dispatch({
        internal: { statusText: 'No Content' },
      });

      assert.equal(state.response.statusText, 'No Content');
    });
  });

  describe('.isFinished', () => {
    it('should read the finished state from the internal record', async () => {
      const state = await Baseline.dispatch({ internal: { finished: true } });

      assert.equal(state.response.isFinished, true);
    });
  });

  describe('.header', () => {
    it('should expose the read-only header part', async () => {
      const state = await Baseline.dispatch({
        kind: 'websocket',
        internal: {
          socket: { readyState: 1, sent: [], closed: null },
          responseHeaders: new Map([['sec-websocket-accept', 'probe']]),
        },
      });

      assert.equal(state.response.header.get('sec-websocket-accept'), 'probe');
    });
  });

  describe('>read-only surface', () => {
    it('should not expose a status setter', async () => {
      const state = await Baseline.dispatch({
        kind: 'websocket',
        internal: { socket: { readyState: 1, sent: [], closed: null } },
      });

      assert.equal(state.response.setStatus, undefined);
    });

    it('should not expose a header mutator', async () => {
      const state = await Baseline.dispatch({
        kind: 'websocket',
        internal: { socket: { readyState: 1, sent: [], closed: null } },
      });

      assert.equal(state.response.header.set, undefined);
      assert.equal(state.response.header.delete, undefined);
    });
  });
});
