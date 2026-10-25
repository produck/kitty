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

    it('should reject a name outside the header name contract', async () => {
      const state = await dispatchWith([]);

      assert.throws(() => state.request.header.get(1));
    });

    it('should reject a value outside the header value contract', async () => {
      const state = await dispatchWith([['x-probe', 1]]);

      assert.throws(() => state.request.header.get('x-probe'));
    });
  });

  describe('.has()', () => {
    it('should report a present name', async () => {
      const state = await dispatchWith([['x-probe', 'yes']]);

      assert.equal(state.request.header.has('x-probe'), true);
    });

    it('should report an absent name', async () => {
      const state = await dispatchWith([['x-probe', 'yes']]);

      assert.equal(state.request.header.has('x-absent'), false);
    });
  });

  describe('.entries()', () => {
    it('should iterate every present name and value', async () => {
      const state = await dispatchWith([
        ['x-probe', 'yes'],
        ['accept', '*/*'],
      ]);

      assert.deepEqual(
        [...state.request.header.entries()],
        [
          ['x-probe', 'yes'],
          ['accept', '*/*'],
        ],
      );
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
