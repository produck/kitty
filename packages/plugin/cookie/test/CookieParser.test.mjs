import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { CookieParser } from '@produck/kitty-plugin-cookie';

function createRecords() {
  return [
    { name: 'a', value: '1' },
    { name: 'b', value: '2' },
  ];
}

describe('constructor()', () => {
  it('should read the records of an array', () => {
    const cookieParser = new CookieParser(createRecords());

    assert.equal(cookieParser.size, 2);
    assert.deepEqual([...cookieParser.keys()], ['a', 'b']);
  });

  it('should read the records of any iterable', () => {
    const cookieParser = new CookieParser(new Set(createRecords()));

    assert.equal(cookieParser.size, 2);
  });

  it('should keep the first record of a repeated name', () => {
    const cookieParser = new CookieParser([
      { name: 'a', value: '1' },
      { name: 'a', value: '2' },
    ]);

    assert.equal(cookieParser.size, 1);
    assert.equal(cookieParser.get('a').value, '1');
  });

  it('should keep the record itself', () => {
    const [record] = createRecords();

    assert.equal(new CookieParser([record]).get('a'), record);
  });

  describe('>failure', () => {
    it('should reject a non-iterable', () => {
      assert.throws(() => new CookieParser(undefined));
      assert.throws(() => new CookieParser(null));
    });

    it('should reject an element that is not a record', () => {
      assert.throws(() => new CookieParser([null]));
      assert.throws(() => new CookieParser(['a=1']));
      assert.throws(() => new CookieParser([{}]));
    });

    it('should reject a name outside the token grammar', () => {
      assert.throws(() => new CookieParser([{ name: 'a b', value: '1' }]));
      assert.throws(() => new CookieParser([{ name: 1, value: '1' }]));
    });

    it('should reject a value outside the cookie-octet grammar', () => {
      assert.throws(() => new CookieParser([{ name: 'a', value: '1 2' }]));
      assert.throws(() => new CookieParser([{ name: 'a', value: 1 }]));
    });
  });
});

describe('.size', () => {
  it('should count the unique names', () => {
    assert.equal(new CookieParser(createRecords()).size, 2);
  });
});

describe('.has()', () => {
  it('should answer true for a present name', () => {
    assert.equal(new CookieParser(createRecords()).has('a'), true);
  });

  it('should answer false for an absent name', () => {
    assert.equal(new CookieParser(createRecords()).has('c'), false);
  });
});

describe('.get()', () => {
  it('should answer the record of a present name', () => {
    assert.deepEqual(new CookieParser(createRecords()).get('a'), {
      name: 'a',
      value: '1',
    });
  });

  it('should answer undefined for an absent name', () => {
    assert.equal(new CookieParser(createRecords()).get('c'), undefined);
  });

  it('should reject a name outside the token grammar', () => {
    assert.throws(() => new CookieParser(createRecords()).get('a b'));
  });
});

describe('.keys()', () => {
  it('should keep the record order', () => {
    assert.deepEqual([...new CookieParser(createRecords()).keys()], ['a', 'b']);
  });
});

describe('.values()', () => {
  it('should answer the records', () => {
    assert.deepEqual(
      [...new CookieParser(createRecords()).values()],
      [
        { name: 'a', value: '1' },
        { name: 'b', value: '2' },
      ],
    );
  });
});

describe('.entries()', () => {
  it('should answer name and record pairs', () => {
    assert.deepEqual(
      [...new CookieParser(createRecords()).entries()],
      [
        ['a', { name: 'a', value: '1' }],
        ['b', { name: 'b', value: '2' }],
      ],
    );
  });
});

describe('[Symbol.iterator]', () => {
  it('should iterate over the records', () => {
    assert.deepEqual(
      [...new CookieParser(createRecords())],
      [
        { name: 'a', value: '1' },
        { name: 'b', value: '2' },
      ],
    );
  });
});
