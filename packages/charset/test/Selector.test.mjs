import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import Selector from '../src/Selector/index.mjs';

class Plain extends Selector {}

function createSelector() {
  return new Plain();
}

describe('abstract gate', () => {
  it('should reject a direct construction', () => {
    assert.throws(() => new Selector(), { message: /abstract/ });
  });
});

describe('iteration surface', () => {
  it('should not be an iterator', () => {
    assert.equal(typeof createSelector()[Symbol.iterator], 'undefined');
  });
});

describe('.findByName()', () => {
  it('should read the name case-insensitively', () => {
    assert.equal(createSelector().findByName('utf-8').mibEnum, 106);
  });

  it('should answer null for an unknown name', () => {
    assert.equal(createSelector().findByName('not-a-charset'), null);
  });

  it('should reject a non-string value', () => {
    assert.throws(() => createSelector().findByName(1), {
      message: /args\[0\]/,
    });
    assert.throws(() => createSelector().findByName(null), {
      message: /args\[0\]/,
    });
  });
});

describe('.findByMibEnum()', () => {
  it('should find a record', () => {
    assert.equal(createSelector().findByMibEnum(106).name, 'UTF-8');
  });

  it('should answer null for an unknown value', () => {
    assert.equal(createSelector().findByMibEnum(1), null);
  });

  it('should reject a non-positive value', () => {
    assert.throws(() => createSelector().findByMibEnum(-1), {
      message: /positive integer/,
    });
  });

  it('should reject a non-number value', () => {
    assert.throws(() => createSelector().findByMibEnum('106'), {
      message: /args\[0\]/,
    });
  });

  it('should reject a non-integer value', () => {
    assert.throws(() => createSelector().findByMibEnum(1.5), {
      message: /integer/,
    });
  });
});

describe('.findByPreferredName()', () => {
  it('should find a record', () => {
    assert.equal(createSelector().findByPreferredName('ISO-8859-1').mibEnum, 4);
  });

  it('should answer null for an unknown name', () => {
    assert.equal(createSelector().findByPreferredName('not-a-charset'), null);
  });

  it('should reject a non-string value', () => {
    assert.throws(() => createSelector().findByPreferredName(null), {
      message: /args\[0\]/,
    });
  });
});

describe('.findByAlias()', () => {
  it('should find a record through an alias', () => {
    assert.equal(createSelector().findByAlias('latin1').mibEnum, 4);
  });

  it('should answer null for an unknown alias', () => {
    assert.equal(createSelector().findByAlias('not-a-charset'), null);
  });

  it('should reject a non-string value', () => {
    assert.throws(() => createSelector().findByAlias(4), {
      message: /args\[0\]/,
    });
  });
});
