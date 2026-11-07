import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Kit from '@produck/kit';

import {
  useRequestContentTypeAccessor,
  useRequestType,
} from '@produck/kitty-plugin-request-type';

describe('::useRequestContentTypeAccessor()', () => {
  it('should reject a kit without an exchange', () => {
    assert.throws(() => useRequestContentTypeAccessor(Kit.global));
  });

  it('should answer the same function as the short alias', () => {
    assert.equal(useRequestType, useRequestContentTypeAccessor);
  });
});
