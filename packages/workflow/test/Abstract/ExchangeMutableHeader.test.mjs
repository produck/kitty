import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Baseline from '../Baseline/index.mjs';

function dispatchWith(headers) {
  return Baseline.dispatch({
    internal: { responseHeaders: new Map(headers) },
  });
}

describe('ExchangeMutableHeader', () => {
  describe('.set()', () => {
    it('should write a name and value', async () => {
      const state = await dispatchWith([]);

      state.response.header.set('x-probe', 'yes');

      assert.equal(state.response.header.get('x-probe'), 'yes');
    });

    it('should overwrite a present name', async () => {
      const state = await dispatchWith([['x-probe', 'first']]);

      state.response.header.set('X-Probe', 'second');

      assert.equal(state.response.header.get('x-probe'), 'second');
      assert.deepEqual(state.response.header.keys(), ['x-probe']);
    });

    it('should reject a non-string value', async () => {
      const state = await dispatchWith([]);

      assert.throws(() => state.response.header.set('x-probe', 1));
    });
  });

  describe('.append()', () => {
    it('should keep the values written under the same name', async () => {
      const state = await dispatchWith([]);

      state.response.header.append('Set-Cookie', 'a=1');
      state.response.header.append('set-cookie', 'b=2');

      assert.deepEqual(state.response.header.get('set-cookie'), ['a=1', 'b=2']);
    });

    it('should answer a plain string for a single value', async () => {
      const state = await dispatchWith([]);

      state.response.header.append('x-probe', 'only');

      assert.equal(state.response.header.get('x-probe'), 'only');
    });

    it('should refuse a single-valued name', async () => {
      const state = await dispatchWith([]);

      for (const key of [
        'content-length',
        'Content-Type',
        'etag',
        'location',
      ]) {
        assert.throws(
          () => state.response.header.append(key, 'x'),
          /MUST NOT be appended/,
        );
      }
    });

    it('should reject a non-string value', async () => {
      const state = await dispatchWith([]);

      assert.throws(() => state.response.header.append('x-probe', 1));
    });
  });

  describe('.delete()', () => {
    it('should remove a present name', async () => {
      const state = await dispatchWith([['x-probe', 'yes']]);

      state.response.header.delete('x-probe');

      assert.equal(state.response.header.get('x-probe'), undefined);
    });

    it('should ignore an absent name', async () => {
      const state = await dispatchWith([]);

      state.response.header.delete('x-absent');

      assert.deepEqual(state.response.header.keys(), []);
    });
  });

  describe('.clear()', () => {
    it('should remove every name', async () => {
      const state = await dispatchWith([
        ['x-probe', 'yes'],
        ['content-type', 'text/plain'],
      ]);

      state.response.header.clear();

      assert.deepEqual(state.response.header.keys(), []);
    });
  });

  describe('>case', () => {
    it('should treat the names case-insensitively', async () => {
      const state = await dispatchWith([]);

      state.response.header.set('X-Probe', 'yes');

      assert.equal(state.response.header.get('x-PROBE'), 'yes');
      assert.deepEqual(state.response.header.keys(), ['x-probe']);
    });
  });
});
