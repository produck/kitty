import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Meta from '@produck/meta-iana-charset';

import { CHARSET } from '../src/Preset.mjs';

describe('::CHARSET.ANY', () => {
  it('should list every IANA MIBenum', () => {
    const expected = Object.values(Meta.data)
      .map((record) => record.mibEnum)
      .sort((left, right) => left - right);

    assert.deepEqual([...CHARSET.ANY], expected);
  });

  it('should be sorted and frozen', () => {
    for (let index = 1; index < CHARSET.ANY.length; index += 1) {
      assert.ok(CHARSET.ANY[index - 1] < CHARSET.ANY[index]);
    }

    assert.throws(() => {
      CHARSET.ANY.push(1);
    });
  });
});

describe('::CHARSET.EMPTY', () => {
  it('should be an empty frozen list', () => {
    assert.deepEqual([...CHARSET.EMPTY], []);
    assert.throws(() => {
      CHARSET.EMPTY.push(1);
    });
  });
});
