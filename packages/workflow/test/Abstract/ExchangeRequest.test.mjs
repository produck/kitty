import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Baseline from '../Baseline/index.mjs';

describe('ExchangeRequest', () => {
  describe('.method', () => {
    it('should read the method from the internal record', async () => {
      const state = await Baseline.dispatch({ internal: { method: 'PATCH' } });

      assert.equal(state.request.method, 'PATCH');
    });

    it('should reject a value outside the http method list', async () => {
      const state = await Baseline.dispatch({ internal: { method: 'BREW' } });

      assert.throws(() => state.request.method);
    });
  });

  describe('.url', () => {
    it('should read the url from the internal record', async () => {
      const state = await Baseline.dispatch({
        internal: { url: 'https://baseline.test/probe' },
      });

      assert.equal(state.request.url.href, 'https://baseline.test/probe');
    });

    it('should resolve a relative url against the host header', async () => {
      const state = await Baseline.dispatch({
        internal: {
          url: '/probe',
          requestHeaders: new Map([['host', 'baseline.test']]),
        },
      });

      assert.equal(state.request.url.href, 'http://baseline.test/probe');
    });

    it('should reject a relative url without a host header', async () => {
      const state = await Baseline.dispatch({ internal: { url: '/probe' } });

      assert.throws(() => state.request.url);
    });
  });

  describe('.header', () => {
    it('should expose the header part', async () => {
      const state = await Baseline.dispatch();

      assert.equal(state.request.header, state.request.header);
      assert.equal(typeof state.request.header.get, 'function');
      assert.equal(typeof state.request.header.keys, 'function');
    });
  });
});
