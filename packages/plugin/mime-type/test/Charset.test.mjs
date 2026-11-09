import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Meta from '@produck/meta-iana-charset';

import * as Charset from '../src/Preset/Charset.mjs';

describe('::ANY', () => {
  it('should list every IANA MIBenum', () => {
    const expected = Object.values(Meta.data)
      .map((record) => record.mibEnum)
      .sort((left, right) => left - right);

    assert.deepEqual([...Charset.ANY], expected);
  });

  it('should be sorted and frozen', () => {
    for (let index = 1; index < Charset.ANY.length; index += 1) {
      assert.ok(Charset.ANY[index - 1] < Charset.ANY[index]);
    }

    assert.throws(() => {
      Charset.ANY.push(1);
    });
  });
});
