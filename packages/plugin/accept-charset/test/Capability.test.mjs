import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Kit from '@produck/kit';

import { useAcceptCharset } from '@produck/kitty-plugin-accept-charset';

describe('::useAcceptCharset()', () => {
  it('should reject a kit without an exchange', () => {
    assert.throws(() => useAcceptCharset(Kit.global));
  });
});
