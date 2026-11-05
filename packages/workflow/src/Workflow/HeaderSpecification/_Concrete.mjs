import { Ow } from '@produck/argot';

import * as P from './_Parser.mjs';
import { I, $I } from './_Symbol.mjs';

const STANDARD_SINGLE_VALUED_SET = new Set([
  'age',
  'content-length',
  'content-location',
  'content-type',
  'date',
  'etag',
  'expires',
  'last-modified',
  'location',
  'retry-after',
]);

export default class HeaderSpecification {
  [I.EXTRA_SINGLE_VALUED_SET] = new Set();

  addSingleValuedHeader(name) {
    this[I.EXTRA_SINGLE_VALUED_SET].add(P.HeaderName(name).toLowerCase());

    return this;
  }

  [$I.ASSERT_APPENDABLE](key) {
    const name = key.toLowerCase();

    if (
      STANDARD_SINGLE_VALUED_SET.has(name) ||
      this[I.EXTRA_SINGLE_VALUED_SET].has(name)
    ) {
      Ow.Error.Common(`The header MUST NOT be appended: ${key}`);
    }
  }
}
