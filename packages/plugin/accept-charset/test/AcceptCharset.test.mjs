import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Concrete as AcceptCharset } from '../src/AcceptCharset/index.mjs';

function createAcceptCharset(headerMap) {
  const exchange = {
    request: {
      header: {
        get: (name) => headerMap[name],
      },
    },
  };

  return new AcceptCharset(exchange, null);
}

describe('.acceptCharset()', () => {
  it('should prefer the higher quality', () => {
    const negotiation = createAcceptCharset({
      'accept-charset': 'utf-8, iso-8859-1;q=0.5',
    });

    assert.equal(negotiation.acceptCharset('iso-8859-1', 'utf-8'), 'utf-8');
  });

  it('should compare case-insensitively', () => {
    const negotiation = createAcceptCharset({ 'accept-charset': 'UTF-8' });

    assert.equal(negotiation.acceptCharset('utf-8'), 'utf-8');
  });

  it('should answer false without an acceptable charset', () => {
    const negotiation = createAcceptCharset({ 'accept-charset': 'utf-8' });

    assert.equal(negotiation.acceptCharset('gbk'), false);
  });

  it('should accept every candidate when the field is absent', () => {
    const negotiation = createAcceptCharset({});

    assert.equal(negotiation.acceptCharset('gbk'), 'gbk');
  });

  it('should prefer the first candidate on equal quality', () => {
    const negotiation = createAcceptCharset({ 'accept-charset': 'utf-8, gbk' });

    assert.equal(negotiation.acceptCharset('gbk', 'utf-8'), 'gbk');
  });

  it('should honour a wildcard', () => {
    const negotiation = createAcceptCharset({ 'accept-charset': '*' });

    assert.equal(negotiation.acceptCharset('gbk'), 'gbk');
  });

  it('should exclude a zero quality range', () => {
    const negotiation = createAcceptCharset({
      'accept-charset': 'utf-8;q=0, *',
    });

    assert.equal(negotiation.acceptCharset('utf-8'), false);
  });

  it('should skip an empty list entry', () => {
    const negotiation = createAcceptCharset({ 'accept-charset': ', utf-8' });

    assert.equal(negotiation.acceptCharset('utf-8'), 'utf-8');
  });
});

describe('candidate gate', () => {
  it('should reject an empty candidate list', () => {
    const negotiation = createAcceptCharset({});

    assert.throws(() => negotiation.acceptCharset());
  });

  it('should reject a candidate outside the contract', () => {
    const negotiation = createAcceptCharset({});

    assert.throws(() => negotiation.acceptCharset(1), {
      message: /args\[0\]/,
    });
    assert.throws(() => negotiation.acceptCharset(''), {
      message: /args\[0\]/,
    });
  });
});

describe('destructuring', () => {
  it('should answer a bound function', () => {
    const negotiation = createAcceptCharset({ 'accept-charset': 'utf-8' });
    const { acceptCharset } = negotiation;

    assert.equal(acceptCharset('utf-8'), 'utf-8');
  });
});
