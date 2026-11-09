import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Selector, SYMBOL } from '../src/index.mjs';

function createSelector(recordList) {
  return new (class Extended extends Selector {
    *[SYMBOL.SELECTOR._I.EXTEND]() {
      yield* recordList;
    }
  })();
}

const VALID_RECORD = {
  name: 'X-CUSTOM',
  mibEnum: 9999,
  preferredName: 'x-preferred',
  aliasList: ['x-alias'],
};

describe('extension records', () => {
  it('should be reachable through every lookup', () => {
    const selector = createSelector([VALID_RECORD]);

    assert.equal(selector.findByName('X-CUSTOM').mibEnum, 9999);
    assert.equal(selector.findByMibEnum(9999).name, 'X-CUSTOM');
    assert.equal(selector.findByPreferredName('x-preferred').mibEnum, 9999);
    assert.equal(selector.findByAlias('X-ALIAS').mibEnum, 9999);
  });

  it('should keep the IANA records reachable', () => {
    const selector = createSelector([VALID_RECORD]);

    assert.equal(selector.findByName('UTF-8').mibEnum, 106);
  });

  it('should answer data without any extension record', () => {
    const selector = createSelector([]);

    assert.equal(selector.findByName('UTF-8').mibEnum, 106);
    assert.equal(selector.findByName('X-CUSTOM'), null);
  });

  it('should walk the extension records on a miss', () => {
    const selector = createSelector([VALID_RECORD]);

    assert.equal(selector.findByName('X-CUSTOM').mibEnum, 9999);
    assert.equal(selector.findByName('not-a-charset'), null);
  });

  it('should default the preferred name to the name', () => {
    const selector = createSelector([
      { name: 'X-Plain', mibEnum: 9998, aliasList: [] },
    ]);

    assert.equal(selector.findByPreferredName('X-PLAIN').mibEnum, 9998);
  });

  it('should be lazy: an early match stops the extension walk', () => {
    let walked = false;

    const selector = new (class Extended extends Selector {
      *[SYMBOL.SELECTOR._I.EXTEND]() {
        walked = true;

        yield VALID_RECORD;
      }
    })();

    selector.findByName('UTF-8');

    assert.equal(walked, false);
  });
});

describe('extension record contract', () => {
  const invalidList = [
    { label: 'a non-object', record: null },
    { label: 'a missing name', record: { mibEnum: 1, aliasList: [] } },
    {
      label: 'an empty name',
      record: { name: '', mibEnum: 1, aliasList: [] },
    },
    {
      label: 'a missing mibEnum',
      record: { name: 'X', aliasList: [] },
    },
    {
      label: 'a non-positive mibEnum',
      record: { name: 'X', mibEnum: 0, aliasList: [] },
    },
    {
      label: 'a non-string preferredName',
      record: { name: 'X', mibEnum: 1, preferredName: 1, aliasList: [] },
    },
    {
      label: 'a missing aliasList',
      record: { name: 'X', mibEnum: 1 },
    },
    {
      label: 'a non-string alias',
      record: { name: 'X', mibEnum: 1, aliasList: [1] },
    },
  ];

  for (const { label, record } of invalidList) {
    it(`should reject ${label}`, () => {
      const selector = createSelector([record]);

      assert.throws(() => selector.findByName('not-a-charset'));
    });
  }
});
