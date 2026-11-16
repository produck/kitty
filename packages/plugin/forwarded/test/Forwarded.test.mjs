import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Concrete as Forwarded } from '../src/Forwarded/index.mjs';

function createForwarded(headerMap) {
  const exchange = {
    request: {
      header: {
        get: (name) => headerMap[name],
      },
    },
  };

  return new Forwarded(exchange);
}

describe('.entryList()', () => {
  it('should answer an empty list when the field is absent', () => {
    assert.deepEqual(createForwarded({}).entryList(), []);
  });

  it('should parse a single element', () => {
    const forwarded = createForwarded({
      forwarded: 'for=192.0.2.60;proto=http;by=203.0.113.43',
    });

    assert.deepEqual(forwarded.entryList(), [
      { for: '192.0.2.60', proto: 'http', by: '203.0.113.43' },
    ]);
  });

  it('should parse a chain in arrival order', () => {
    const forwarded = createForwarded({
      forwarded: 'for=192.0.2.43, for=198.51.100.17',
    });

    assert.deepEqual(forwarded.entryList(), [
      { for: '192.0.2.43' },
      { for: '198.51.100.17' },
    ]);
  });

  it('should keep a comma inside a quoted value', () => {
    const forwarded = createForwarded({
      forwarded: 'for="192.0.2.60:8080";by="proxy, main"',
    });

    assert.deepEqual(forwarded.entryList(), [
      { for: '192.0.2.60:8080', by: 'proxy, main' },
    ]);
  });

  it('should unescape a quoted pair', () => {
    const forwarded = createForwarded({ forwarded: 'by="a\\"b"' });

    assert.deepEqual(forwarded.entryList(), [{ by: 'a"b' }]);
  });

  it('should fold a parameter name to lower case', () => {
    const forwarded = createForwarded({ forwarded: 'Proto=HTTPS' });

    assert.deepEqual(forwarded.entryList(), [{ proto: 'HTTPS' }]);
  });

  it('should drop an element repeating a parameter', () => {
    const forwarded = createForwarded({ forwarded: 'for=a;for=b, for=c' });

    assert.deepEqual(forwarded.entryList(), [{ for: 'c' }]);
  });

  it('should drop an empty element', () => {
    const forwarded = createForwarded({ forwarded: ', for=a' });

    assert.deepEqual(forwarded.entryList(), [{ for: 'a' }]);
  });

  it('should ignore a pair without a value', () => {
    const forwarded = createForwarded({ forwarded: 'for=a;by;proto=https' });

    assert.deepEqual(forwarded.entryList(), [{ for: 'a', proto: 'https' }]);
  });
});

describe('.client()', () => {
  it('should answer the first element address', () => {
    const forwarded = createForwarded({
      forwarded: 'for=192.0.2.43, for=198.51.100.17',
    });

    assert.equal(forwarded.client(), '192.0.2.43');
  });

  it('should answer null when the field is absent', () => {
    assert.equal(createForwarded({}).client(), null);
  });

  it('should answer null when the first element has no for', () => {
    const forwarded = createForwarded({ forwarded: 'proto=https' });

    assert.equal(forwarded.client(), null);
  });
});

describe('.protocol()', () => {
  it('should answer the first element proto', () => {
    const forwarded = createForwarded({ forwarded: 'for=a;proto=https' });

    assert.equal(forwarded.protocol(), 'https');
  });

  it('should answer null when the field is absent', () => {
    assert.equal(createForwarded({}).protocol(), null);
  });
});
