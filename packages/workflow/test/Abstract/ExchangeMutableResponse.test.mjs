import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Baseline from '../Baseline/index.mjs';

describe('ExchangeMutableResponse', () => {
  describe('.setStatus()', () => {
    it('should write the status through the internal record', async () => {
      const state = await Baseline.dispatch();

      state.response.setStatus(201);

      assert.equal(state.internal.status, 201);
    });

    it('should write the status text through the internal record', async () => {
      const state = await Baseline.dispatch();

      state.response.setStatus(201, 'Created');

      assert.equal(state.internal.status, 201);
      assert.equal(state.internal.statusText, 'Created');
    });

    it('should keep the status text when it is omitted', async () => {
      const state = await Baseline.dispatch({ internal: { statusText: 'OK' } });

      state.response.setStatus(201);

      assert.equal(state.internal.statusText, 'OK');
    });

    it('should reject a status outside the http status range', async () => {
      const state = await Baseline.dispatch();

      assert.throws(() => state.response.setStatus(99));
      assert.throws(() => state.response.setStatus(600));
    });
  });

  describe('.header', () => {
    it('should expose the mutable header part', async () => {
      const state = await Baseline.dispatch();

      state.response.header.set('x-probe', 'yes');

      assert.equal(state.internal.responseHeaders.get('x-probe'), 'yes');
      assert.equal(state.response.statusCode, 200);
    });
  });
});
