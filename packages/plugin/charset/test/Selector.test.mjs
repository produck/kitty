import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Concrete } from '../src/Selector/index.mjs';
import { $I } from '../src/Selector/_Symbol.mjs';

const UTF_8 = {
  name: 'kitty-utf-8',
  mibEnum: 106,
  preferredName: 'kitty-utf-8',
  aliasList: ['kitty-utf-8'],
};

const LATIN_1 = {
  name: 'kitty-iso-8859-1',
  mibEnum: 9998,
  preferredName: 'kitty-iso-8859-1',
  aliasList: ['kitty-iso-8859-1'],
};

describe('Selector', () => {
  it('should answer every IANA record when nothing is extended', () => {
    assert.notEqual(new Concrete().findByName('utf-8'), null);
  });

  it('should walk every extended record', () => {
    const selector = new Concrete();

    selector[$I.REGISTER](UTF_8);
    selector[$I.REGISTER](LATIN_1);

    assert.equal(selector.findByName('kitty-iso-8859-1').mibEnum, 9998);
  });

  describe('.findByName()', () => {
    it('should reject a non string', () => {
      assert.throws(() => new Concrete().findByName(1));
    });

    it('should answer a registered record regardless of the case', () => {
      const selector = new Concrete();

      selector[$I.REGISTER](UTF_8);

      assert.deepEqual(selector.findByName('KITTY-UTF-8'), {
        name: 'kitty-utf-8',
        mibEnum: 106,
        preferredName: 'kitty-utf-8',
        aliasList: ['kitty-utf-8'],
      });
    });

    it('should answer null for an unknown name', () => {
      assert.equal(new Concrete().findByName('kitty-unknown'), null);
    });
  });

  describe('.findByMibEnum()', () => {
    it('should reject a non positive integer', () => {
      assert.throws(() => new Concrete().findByMibEnum(0));
      assert.throws(() => new Concrete().findByMibEnum('106'));
    });

    it('should answer a registered record', () => {
      const selector = new Concrete();

      selector[$I.REGISTER](LATIN_1);

      assert.equal(selector.findByMibEnum(9998).name, 'kitty-iso-8859-1');
    });
  });

  describe('.findByAlias()', () => {
    it('should reject a non string', () => {
      assert.throws(() => new Concrete().findByAlias(null));
    });

    it('should answer a registered record', () => {
      const selector = new Concrete();

      selector[$I.REGISTER](UTF_8);

      assert.equal(selector.findByAlias('KITTY-UTF-8').name, 'kitty-utf-8');
    });
  });

  describe('.$register()', () => {
    it('should answer the registered record', () => {
      const selector = new Concrete();

      assert.deepEqual(selector[$I.REGISTER](UTF_8), UTF_8);
    });

    it('should answer a copy', () => {
      const selector = new Concrete();

      assert.notEqual(selector[$I.REGISTER](UTF_8), UTF_8);
    });

    it('should reject a duplicated name regardless of the case', () => {
      const selector = new Concrete();

      selector[$I.REGISTER](UTF_8);

      assert.throws(() => {
        selector[$I.REGISTER]({ ...UTF_8, name: 'KITTY-UTF-8' });
      });
    });

    it('should keep the registry untouched on a rejected record', () => {
      const selector = new Concrete();

      selector[$I.REGISTER](UTF_8);

      assert.throws(() => selector[$I.REGISTER]({ ...UTF_8, mibEnum: -1 }));
      assert.equal(selector.findByName('kitty-utf-8').mibEnum, 106);
    });

    it('should accept a record sharing a MIBenum with IANA', () => {
      const selector = new Concrete();

      assert.doesNotThrow(() =>
        selector[$I.REGISTER]({ ...UTF_8, mibEnum: 106 }),
      );
    });
  });
});
