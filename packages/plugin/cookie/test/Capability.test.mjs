import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Kit from '@produck/kit';

import { useCookie } from '@produck/kitty-plugin-cookie';

describe('::useCookie()', () => {
  it('should reject a kit without an exchange', () => {
    assert.throws(() => useCookie(Kit.global));
  });
});
