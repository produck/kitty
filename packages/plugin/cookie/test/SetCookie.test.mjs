import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as SetCookie from '../src/Cookie/SetCookie.mjs';

describe('::normalizeOptions()', () => {
  it('should answer the only legal shape for an empty record', () => {
    assert.deepEqual(SetCookie.normalizeOptions({}), {
      path: '/',
      domain: null,
      maxAge: null,
      expires: null,
      secure: false,
      httpOnly: true,
      sameSite: 'Lax',
    });
  });

  it('should answer the same shape without an argument', () => {
    assert.deepEqual(SetCookie.normalizeOptions(), {
      path: '/',
      domain: null,
      maxAge: null,
      expires: null,
      secure: false,
      httpOnly: true,
      sameSite: 'Lax',
    });
  });

  it('should reject a value that is not an options record', () => {
    for (const options of ['x', null, [], 1]) {
      assert.throws(() => SetCookie.normalizeOptions(options));
    }
  });
});
