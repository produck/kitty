import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Baseline from '../Baseline/index.mjs';

function dispatchWith(headers) {
  return Baseline.dispatch({
    internal: { requestHeaders: new Map(headers) },
  });
}

describe('ExchangeRequestHeader', () => {
  describe('.get()', () => {
    it('should return the value of a present name', async () => {
      const state = await dispatchWith([['x-probe', 'yes']]);

      assert.equal(state.request.header.get('x-probe'), 'yes');
    });

    it('should return undefined for an absent name', async () => {
      const state = await dispatchWith([['x-probe', 'yes']]);

      assert.equal(state.request.header.get('x-absent'), undefined);
    });

    it('should read the name case-insensitively', async () => {
      const state = await dispatchWith([['x-probe', 'yes']]);

      assert.equal(state.request.header.get('X-Probe'), 'yes');
    });
  });

  describe('.keys()', () => {
    it('should return every present name', async () => {
      const state = await dispatchWith([
        ['x-probe', 'yes'],
        ['accept', '*/*'],
      ]);

      assert.deepEqual(state.request.header.keys(), ['x-probe', 'accept']);
    });
  });
});
