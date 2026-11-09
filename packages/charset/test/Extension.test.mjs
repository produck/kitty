import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import Selector from '../src/Selector/index.mjs';
import { _I } from '../src/Selector/_Symbol.mjs';

const CUSTOM_RECORD = {
  name: 'X-CUSTOM',
  mibEnum: 9999,
  preferredName: 'x-preferred',
  aliasList: ['x-custom', 'x-alias'],
};

function withExtra(record) {
  return class Extended extends Selector {
    *[_I.EXTRA]() {
      yield { ...record, aliasList: [...record.aliasList] };
    }
  };
}

describe('extension iterator', () => {
  it('should append records to every query', () => {
    const selector = new (withExtra(CUSTOM_RECORD))();

    assert.equal(selector.findByName('x-custom').mibEnum, 9999);
    assert.equal(selector.findByMibEnum(9999).name, 'X-CUSTOM');
    assert.equal(selector.findByPreferredName('X-PREFERRED').mibEnum, 9999);
    assert.equal(selector.findByAlias('X-ALIAS').mibEnum, 9999);
  });

  it('should keep the IANA records reachable', () => {
    const selector = new (withExtra(CUSTOM_RECORD))();

    assert.equal(selector.findByName('UTF-8').mibEnum, 106);
  });

  it('should answer nothing without an override', () => {
    class Extended extends Selector {}

    assert.equal(new Extended().findByName('x-custom'), null);
  });
});
