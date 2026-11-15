import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { assertCandidateList, defaultSpec, qualityOf } from '../src/index.mjs';

describe('::assertCandidateList()', () => {
  it('should accept a list of non-empty strings', () => {
    assert.doesNotThrow(() => assertCandidateList(['gzip', 'br']));
  });

  it('should reject an empty list', () => {
    assert.throws(() => assertCandidateList([]), {
      message: /non-empty candidate list/,
    });
  });

  it('should reject a non-string candidate', () => {
    assert.throws(() => assertCandidateList([1]), { message: /args\[0\]/ });
  });

  it('should reject a blank candidate', () => {
    assert.throws(() => assertCandidateList(['  ']), { message: /args\[0\]/ });
  });

  it('should name the offending index', () => {
    assert.throws(() => assertCandidateList(['ok', '']), {
      message: /args\[1\]/,
    });
  });
});

describe('::defaultSpec()', () => {
  it('should answer the default range when the field is absent', () => {
    assert.deepEqual(defaultSpec([], '*/*'), [{ value: '*/*', q: 1 }]);
  });

  it('should keep a parsed list untouched', () => {
    const specList = [{ value: 'gzip', q: 0.5 }];

    assert.deepEqual(defaultSpec(specList, '*'), specList);
  });
});

describe('::qualityOf()', () => {
  const specificityOf = (value) => {
    if (value === 'br') {
      return 2;
    }
    if (value === '*') {
      return 1;
    }
    return 0;
  };

  it('should answer the weight of the matching range', () => {
    const specList = [
      { value: 'br', q: 0.5 },
      { value: '*', q: 1 },
    ];

    assert.equal(qualityOf(specList, specificityOf), 0.5);
  });

  it('should let a specific zero weight outrank the wildcard', () => {
    const specList = [
      { value: 'br', q: 0 },
      { value: '*', q: 1 },
    ];

    assert.equal(qualityOf(specList, specificityOf), 0);
  });

  it('should fall back to the wildcard without a specific range', () => {
    const specList = [{ value: '*', q: 0.8 }];

    assert.equal(qualityOf(specList, specificityOf), 0.8);
  });

  it('should answer zero when nothing matches', () => {
    const specList = [{ value: 'gzip', q: 1 }];

    assert.equal(qualityOf(specList, specificityOf), 0);
  });

  it('should ignore a lower specific range after a higher one', () => {
    const specList = [
      { value: 'br', q: 0.9 },
      { value: '*', q: 1 },
      { value: 'br', q: 0.1 },
    ];

    assert.equal(qualityOf(specList, specificityOf), 0.9);
  });
});
