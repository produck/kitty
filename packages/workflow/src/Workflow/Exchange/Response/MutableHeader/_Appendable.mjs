import { Ow } from '@produck/argot';
import { deepFreeze } from '@produck/deep-freeze-enumerable';

const SINGLE_VALUED_SET = new Set(
  deepFreeze([
    'content-length',
    'content-type',
    'content-location',
    'etag',
    'last-modified',
    'date',
    'expires',
    'location',
    'retry-after',
    'age',
  ]),
);

export function assertAppendable(key) {
  if (SINGLE_VALUED_SET.has(key.toLowerCase())) {
    Ow.Error.Common(`The header MUST NOT be appended: ${key}`);
  }
}
