import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Baseline from '../Baseline/index.mjs';

describe('HttpRequest', () => {
  describe('.body', () => {
    it('should expose the request body part', async () => {
      const state = await Baseline.dispatch({
        internal: { method: 'POST' },
      });

      assert.equal(typeof state.request.body.distributor, 'object');
    });

    it('should reject a method outside the allowed body methods', async () => {
      const state = await Baseline.dispatch({ internal: { method: 'GET' } });

      assert.throws(() => state.request.body);
    });

    it('should accept a method added through the configuration', async () => {
      const state = await Baseline.dispatch({
        internal: { method: 'GET' },
        config: { AllowedBodyMethods: ['GET'] },
      });

      assert.equal(typeof state.request.body.distributor, 'object');
    });
  });
});
