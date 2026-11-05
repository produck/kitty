import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as HeaderSpecification from '../../src/Workflow/HeaderSpecification/index.mjs';
import * as Baseline from '../Baseline/index.mjs';

function dispatchWith(options) {
  return Baseline.dispatch(options);
}

describe('HeaderSpecification', () => {
  describe('.addSingleValuedHeader()', () => {
    it('should refuse an appended name once added', async () => {
      const specification = new HeaderSpecification.Concrete();

      specification.addSingleValuedHeader('X-Request-Id');

      const state = await dispatchWith({ specification });

      assert.throws(() => state.response.header.append('x-request-id', '1'));
    });

    it('should keep the standard names in place', async () => {
      const specification = new HeaderSpecification.Concrete();

      specification.addSingleValuedHeader('x-request-id');

      const state = await dispatchWith({ specification });

      assert.throws(() => state.response.header.append('content-length', '1'));
      assert.doesNotThrow(() => state.response.header.append('x-probe', '1'));
    });

    it('should reject a non-string name', () => {
      const specification = new HeaderSpecification.Concrete();

      assert.throws(() => specification.addSingleValuedHeader(1));
    });

    it('should reject an empty name', () => {
      const specification = new HeaderSpecification.Concrete();

      assert.throws(() => specification.addSingleValuedHeader(''));
    });
  });
});
