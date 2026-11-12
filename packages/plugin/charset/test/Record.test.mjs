import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Kit from '@produck/kit';

import { Record } from '../src/index.mjs';
import { copy, normalize } from '../src/Selector/Record.mjs';

const RECORD = {
  name: 'utf-8',
  mibEnum: 106,
  preferredName: 'utf-8',
  aliasList: ['utf-8'],
};

describe('::Record.register()', () => {
  it('should reject a non workflow', () => {
    assert.throws(() => Record.register(Kit.global, RECORD));
    assert.throws(() => Record.register(null, RECORD));
  });
});

describe('copy()', () => {
  it('should answer an equal record', () => {
    assert.deepEqual(copy(RECORD), RECORD);
  });

  it('should answer a new alias list', () => {
    assert.notEqual(copy(RECORD).aliasList, RECORD.aliasList);
  });
});

describe('::normalize()', () => {
  it('should reject a non plain object', () => {
    assert.throws(() => normalize(null));
    assert.throws(() => normalize([]));
    assert.throws(() => normalize('utf-8'));
  });

  describe('.name', () => {
    it('should keep a valid name', () => {
      assert.equal(normalize({ ...RECORD }).name, 'utf-8');
    });

    it('should reject an invalid name', () => {
      assert.throws(() => normalize({ ...RECORD, name: '' }));
      assert.throws(() => normalize({ ...RECORD, name: 'utf 8' }));
      assert.throws(() => normalize({ ...RECORD, name: 1 }));
    });
  });

  describe('.mibEnum', () => {
    it('should keep a positive integer', () => {
      assert.equal(normalize({ ...RECORD }).mibEnum, 106);
    });

    it('should reject an invalid value', () => {
      assert.throws(() => normalize({ ...RECORD, mibEnum: 0 }));
      assert.throws(() => normalize({ ...RECORD, mibEnum: -1 }));
      assert.throws(() => normalize({ ...RECORD, mibEnum: 1.5 }));
      assert.throws(() => normalize({ ...RECORD, mibEnum: '106' }));
    });
  });

  describe('.preferredName', () => {
    it('should fall back to the name', () => {
      const { preferredName: _ignored, ...rest } = RECORD;

      assert.equal(normalize(rest).preferredName, 'utf-8');
    });

    it('should keep a valid preferred name', () => {
      assert.equal(
        normalize({ ...RECORD, preferredName: 'UTF-8' }).preferredName,
        'UTF-8',
      );
    });

    it('should reject an invalid preferred name', () => {
      assert.throws(() => normalize({ ...RECORD, preferredName: '' }));
      assert.throws(() => normalize({ ...RECORD, preferredName: 'a b' }));
      assert.throws(() => normalize({ ...RECORD, preferredName: null }));
    });
  });

  describe('.aliasList', () => {
    it('should reject a non array', () => {
      assert.throws(() => normalize({ ...RECORD, aliasList: undefined }));
      assert.throws(() => normalize({ ...RECORD, aliasList: 'utf-8' }));
      assert.throws(() => normalize({ ...RECORD, aliasList: {} }));
    });

    it('should reject an invalid alias', () => {
      assert.throws(() => normalize({ ...RECORD, aliasList: [1] }));
      assert.throws(() => normalize({ ...RECORD, aliasList: [''] }));
      assert.throws(() => normalize({ ...RECORD, aliasList: ['a b'] }));
    });

    it('should fold case and drop duplicates', () => {
      const record = normalize({
        ...RECORD,
        aliasList: ['UTF-8', 'utf-8', 'Utf-8'],
      });

      assert.deepEqual(record.aliasList, ['utf-8']);
    });

    it('should always list the name and the preferred name', () => {
      const record = normalize({
        name: 'utf-8',
        mibEnum: 106,
        preferredName: 'UTF-8',
        aliasList: [],
      });

      assert.deepEqual(record.aliasList, ['utf-8']);
    });

    it('should answer a frozen list', () => {
      const record = normalize(RECORD);

      assert.throws(() => {
        record.aliasList.push('x');
      });
    });
  });
});
