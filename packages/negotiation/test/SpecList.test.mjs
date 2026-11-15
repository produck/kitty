import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SpecList } from '../src/index.mjs';

describe('::SpecList()', () => {
  it('should answer an empty list for a missing field', () => {
    assert.deepEqual(SpecList(undefined), []);
    assert.deepEqual(SpecList(null), []);
    assert.deepEqual(SpecList(''), []);
  });

  it('should parse a single value without a weight', () => {
    assert.deepEqual(SpecList('gzip'), [{ value: 'gzip', q: 1 }]);
  });

  it('should fold values to lower case', () => {
    assert.deepEqual(SpecList('UTF-8'), [{ value: 'utf-8', q: 1 }]);
  });

  it('should parse an explicit weight', () => {
    assert.deepEqual(SpecList('gzip;q=0.5'), [{ value: 'gzip', q: 0.5 }]);
  });

  it('should accept an upper case parameter name', () => {
    assert.deepEqual(SpecList('gzip;Q=0.5'), [{ value: 'gzip', q: 0.5 }]);
  });

  it('should parse a list of ranges', () => {
    assert.deepEqual(SpecList('text/html;q=0.5, application/json'), [
      { value: 'text/html', q: 0.5 },
      { value: 'application/json', q: 1 },
    ]);
  });

  it('should skip an empty list entry', () => {
    assert.deepEqual(SpecList(', gzip'), [{ value: 'gzip', q: 1 }]);
  });

  it('should clamp a weight above one', () => {
    assert.deepEqual(SpecList('gzip;q=2'), [{ value: 'gzip', q: 1 }]);
  });

  it('should answer zero for an unparsable weight', () => {
    assert.deepEqual(SpecList('gzip;q=abc'), [{ value: 'gzip', q: 0 }]);
  });

  it('should answer zero for a negative weight', () => {
    assert.deepEqual(SpecList('gzip;q=-1'), [{ value: 'gzip', q: 0 }]);
  });

  it('should ignore a non-weight parameter', () => {
    assert.deepEqual(SpecList('text/html;level=1;q=0.2'), [
      { value: 'text/html', q: 0.2 },
    ]);
  });
});
