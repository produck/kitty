import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Cookie, SYMBOL } from '@produck/kitty-plugin-cookie';

const I = SYMBOL.COOKIE._I;

function createCookie(source = '') {
  const state = { source, written: [] };

  class TestCookie extends Cookie {
    [I.READ]() {
      return state.source;
    }

    [I.WRITE](line) {
      state.written.push(line);
    }
  }

  return { cookie: new TestCookie(), state };
}

describe('.size', () => {
  it('should count the unique names of the read header', () => {
    assert.equal(createCookie('a=1; a=2; b=2').cookie.size, 2);
  });

  it('should read the source only once', () => {
    const { cookie, state } = createCookie('a=1');

    assert.equal(cookie.size, 1);

    state.source = 'b=2';

    assert.equal(cookie.get('a').value, '1');
    assert.equal(cookie.get('b'), undefined);
  });
});

describe('.has()', () => {
  it('should answer true for a present name', () => {
    assert.equal(createCookie('a=1').cookie.has('a'), true);
  });

  it('should answer false for an absent name', () => {
    assert.equal(createCookie('a=1').cookie.has('b'), false);
  });
});

describe('.get()', () => {
  it('should answer the record of a present name', () => {
    assert.deepEqual(createCookie('a=1').cookie.get('a'), {
      name: 'a',
      value: '1',
    });
  });

  it('should answer undefined for an absent name', () => {
    assert.equal(createCookie('a=1').cookie.get('b'), undefined);
  });

  it('should reject a name outside the token grammar', () => {
    assert.throws(() => createCookie('a=1').cookie.get('a b'));
  });

  it('should keep an empty value', () => {
    assert.equal(createCookie('a=; b=2').cookie.get('a').value, '');
  });

  it('should keep an equals sign inside the value', () => {
    assert.equal(createCookie('a=b=c').cookie.get('a').value, 'b=c');
  });

  it('should trim the whitespace around a pair', () => {
    assert.equal(createCookie(' a = 1 ').cookie.get('a').value, '1');
  });

  it('should strip the quotes around a value', () => {
    assert.equal(createCookie('a="1"').cookie.get('a').value, '1');
  });

  it('should keep an empty quoted value', () => {
    assert.equal(createCookie('a=""').cookie.get('a').value, '');
  });
});

describe('.keys()', () => {
  it('should keep the header order', () => {
    assert.deepEqual([...createCookie('b=2; a=1').cookie.keys()], ['b', 'a']);
  });

  describe('>dropped pair', () => {
    it('should drop a pair without an equals sign', () => {
      assert.deepEqual([...createCookie('a; b=2').cookie.keys()], ['b']);
    });

    it('should drop a pair with an empty name', () => {
      assert.deepEqual([...createCookie('=1; b=2').cookie.keys()], ['b']);
    });

    it('should drop a legacy attribute name', () => {
      assert.deepEqual(
        [...createCookie('$Version=1; $Path=/; a=1').cookie.keys()],
        ['a'],
      );
    });

    it('should drop a name outside the token grammar', () => {
      assert.deepEqual([...createCookie('a b=1; c=2').cookie.keys()], ['c']);
    });

    it('should drop a value outside the cookie-octet grammar', () => {
      assert.deepEqual([...createCookie('a=b"c; d=1').cookie.keys()], ['d']);
    });

    it('should drop a quoted value outside the cookie-octet grammar', () => {
      assert.deepEqual([...createCookie('a="b c"; d=1').cookie.keys()], ['d']);
    });

    it('should drop an unbalanced quote', () => {
      assert.deepEqual([...createCookie('a="1; b=2').cookie.keys()], ['b']);
    });

    it('should drop a lone quote', () => {
      assert.deepEqual([...createCookie('a="; b=2').cookie.keys()], ['b']);
    });

    it('should drop an empty segment', () => {
      assert.deepEqual([...createCookie('; ;a=1;').cookie.keys()], ['a']);
    });
  });
});

describe('.values()', () => {
  it('should answer the records', () => {
    assert.deepEqual(
      [...createCookie('a=1; b=2').cookie.values()],
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
      [...createCookie('a=1').cookie.entries()],
      [['a', { name: 'a', value: '1' }]],
    );
  });
});

describe('[Symbol.iterator]', () => {
  it('should iterate over the records', () => {
    assert.deepEqual(
      [...createCookie('a=1').cookie],
      [{ name: 'a', value: '1' }],
    );
  });
});

describe('.set()', () => {
  it('should write one line with the default options', () => {
    const { cookie, state } = createCookie();

    cookie.set('a', '1');

    assert.deepEqual(state.written, ['a=1; Path=/; HttpOnly; SameSite=Lax']);
  });

  it('should write every attribute in order', () => {
    const { cookie, state } = createCookie();

    cookie.set('a', '1', {
      expires: new Date(Date.UTC(2020, 0, 1)),
      maxAge: 60,
      domain: 'example.com',
      path: '/app',
      secure: true,
      httpOnly: false,
      sameSite: 'strict',
    });

    assert.deepEqual(state.written, [
      'a=1; Expires=Wed, 01 Jan 2020 00:00:00 GMT; Max-Age=60; ' +
        'Domain=example.com; Path=/app; Secure; SameSite=Strict',
    ]);
  });

  it('should read a same site value in any case', () => {
    const { cookie, state } = createCookie();

    cookie.set('a', '1', { sameSite: 'NONE', secure: true });

    assert.deepEqual(state.written, [
      'a=1; Path=/; Secure; HttpOnly; SameSite=None',
    ]);
  });

  it('should keep a negative max age', () => {
    const { cookie, state } = createCookie();

    cookie.set('a', '1', { maxAge: -1 });

    assert.deepEqual(state.written, [
      'a=1; Max-Age=-1; Path=/; HttpOnly; SameSite=Lax',
    ]);
  });

  it('should reject a name outside the token grammar', () => {
    const { cookie, state } = createCookie();

    assert.throws(() => cookie.set('a b', '1'));
    assert.equal(state.written.length, 0);
  });

  it('should reject a value outside the cookie-octet grammar', () => {
    const { cookie, state } = createCookie();

    assert.throws(() => cookie.set('a', '1 2'));
    assert.throws(() => cookie.set('a', 1));
    assert.equal(state.written.length, 0);
  });

  describe('>options', () => {
    it('should reject a value that is not an options record', () => {
      const { cookie, state } = createCookie();

      for (const options of ['x', null, [], 1]) {
        assert.throws(() => cookie.set('a', '1', options));
      }

      assert.equal(state.written.length, 0);
    });

    it('should reject an option name outside the contract', () => {
      const { cookie } = createCookie();

      assert.throws(() => cookie.set('a', '1', { pth: '/' }));
    });

    it('should reject a path outside the av-octet grammar', () => {
      const { cookie } = createCookie();

      assert.throws(() => cookie.set('a', '1', { path: 'a b' }));
      assert.throws(() => cookie.set('a', '1', { path: '' }));
      assert.throws(() => cookie.set('a', '1', { path: 1 }));
    });

    it('should reject a domain outside the av-octet grammar', () => {
      const { cookie } = createCookie();

      assert.throws(() => cookie.set('a', '1', { domain: 'a;b' }));
    });

    it('should reject a max age that is not an integer', () => {
      const { cookie } = createCookie();

      assert.throws(() => cookie.set('a', '1', { maxAge: 1.5 }));
      assert.throws(() => cookie.set('a', '1', { maxAge: '60' }));
    });

    it('should reject an expires value that is not a valid date', () => {
      const { cookie } = createCookie();

      assert.throws(() => cookie.set('a', '1', { expires: 1 }));
      assert.throws(() => cookie.set('a', '1', { expires: new Date('x') }));
    });

    it('should reject a boolean option of another type', () => {
      const { cookie } = createCookie();

      assert.throws(() => cookie.set('a', '1', { secure: 'yes' }));
      assert.throws(() => cookie.set('a', '1', { httpOnly: 1 }));
    });

    it('should reject a same site value outside the contract', () => {
      const { cookie } = createCookie();

      assert.throws(() => cookie.set('a', '1', { sameSite: 'foo' }));
      assert.throws(() => cookie.set('a', '1', { sameSite: 1 }));
    });

    it('should reject SameSite=None without Secure', () => {
      const { cookie } = createCookie();

      assert.throws(() => cookie.set('a', '1', { sameSite: 'none' }));
    });
  });
});

describe('>implemented member', () => {
  it('should reject an implementation without the read member', () => {
    class Incomplete extends Cookie {}

    assert.throws(() => new Incomplete().size);
  });

  it('should reject an implementation without the write member', () => {
    class Incomplete extends Cookie {
      [I.READ]() {
        return '';
      }
    }

    assert.throws(() => new Incomplete().set('a', '1'));
  });
});
