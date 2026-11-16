import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Kit from '@produck/kit';

import { useForwarded } from '@produck/kitty-plugin-forwarded';

describe('::useForwarded()', () => {
  it('should reject a kit without an exchange', () => {
    assert.throws(() => useForwarded(Kit.global));
  });
});
