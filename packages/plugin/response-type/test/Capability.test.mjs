import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Kit from '@produck/kit';

import {
  useResponseContentTypeAccessor,
  useResponseType,
} from '@produck/kitty-plugin-response-type';

describe('::useResponseContentTypeAccessor()', () => {
  it('should reject a kit without a workflow', () => {
    assert.throws(() => useResponseContentTypeAccessor(Kit.global));
  });

  it('should answer the same function as the short alias', () => {
    assert.equal(useResponseType, useResponseContentTypeAccessor);
  });
});
