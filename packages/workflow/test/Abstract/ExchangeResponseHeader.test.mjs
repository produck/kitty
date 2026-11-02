import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Baseline from '../Baseline/index.mjs';

async function dispatchWith(headers) {
  const state = await Baseline.dispatch({
    internal: { responseHeaders: new Map(headers) },
  });

  return { response: { header: new Baseline.ResponseHeader(state.exchange) } };
}

describe('ExchangeResponseHeader', () => {
  describe('.get()', () => {
    it('should return the value of a present name', async () => {
      const state = await dispatchWith([['x-probe', 'yes']]);

      assert.equal(state.response.header.get('x-probe'), 'yes');
    });

    it('should return undefined for an absent name', async () => {
      const state = await dispatchWith([['x-probe', 'yes']]);

      assert.equal(state.response.header.get('x-absent'), undefined);
    });

    it('should read the name case-insensitively', async () => {
      const state = await dispatchWith([['x-probe', 'yes']]);

      assert.equal(state.response.header.get('X-Probe'), 'yes');
    });

    it('should reject a value outside the header value contract', async () => {
      const state = await dispatchWith([['x-probe', 1]]);

      assert.throws(() => state.response.header.get('x-probe'));
    });
  });

  describe('.has()', () => {
    it('should report a present name', async () => {
      const state = await dispatchWith([['x-probe', 'yes']]);

      assert.equal(state.response.header.has('x-probe'), true);
    });

    it('should report an absent name', async () => {
      const state = await dispatchWith([['x-probe', 'yes']]);

      assert.equal(state.response.header.has('x-absent'), false);
    });
  });

  describe('.entries()', () => {
    it('should iterate every present name and value', async () => {
      const state = await dispatchWith([
        ['x-probe', 'yes'],
        ['content-type', 'text/plain'],
      ]);

      assert.deepEqual(
        [...state.response.header.entries()],
        [
          ['x-probe', 'yes'],
          ['content-type', 'text/plain'],
        ],
      );
    });
  });

  describe('.keys()', () => {
    it('should return every present name', async () => {
      const state = await dispatchWith([
        ['x-probe', 'yes'],
        ['content-type', 'text/plain'],
      ]);

      assert.deepEqual(state.response.header.keys(), [
        'x-probe',
        'content-type',
      ]);
    });
  });
});
