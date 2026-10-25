import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Baseline from '../Baseline/index.mjs';

describe('HttpResponse', () => {
  describe('.body', () => {
    it('should expose the response body part', async () => {
      const state = await Baseline.dispatch();

      assert.equal(typeof state.response.body.data, 'object');
    });
  });

  describe('.setStatus()', () => {
    it('should write the status of the http response', async () => {
      const state = await Baseline.dispatch();

      state.response.setStatus(202, 'Accepted');

      assert.equal(state.internal.status, 202);
      assert.equal(state.internal.statusText, 'Accepted');
    });
  });
});
