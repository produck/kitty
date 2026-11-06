export * from '../_Parser.mjs';

import { Is, ThrowTypeError } from '@produck/argot';

import * as P from '../_Parser.mjs';

export function CookieRecord(value) {
  if (!Is.Type.Object(value) || value === null) {
    ThrowTypeError('member', 'a cookie record');
  }

  P.CookieName(value.name);
  P.CookieValue(value.value);

  return value;
}

export function CookieRecords(value) {
  if (!Is.Iterable(value)) {
    ThrowTypeError('member', 'an iterable of cookie records');
  }

  const records = [];

  for (const record of value) {
    records.push(CookieRecord(record));
  }

  return records;
}
