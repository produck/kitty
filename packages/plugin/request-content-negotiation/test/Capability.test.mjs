import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Kit from '@produck/kit';

import { useContentNegotiation } from '@produck/kitty-plugin-request-content-negotiation';

describe('::useContentNegotiation()', () => {
  it('should reject a kit without an exchange', () => {
    assert.throws(() => useContentNegotiation(Kit.global));
  });
});
