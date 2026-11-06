export * from '../_Parser.mjs';

import { Is, ThrowTypeError } from '@produck/argot';

import { CookieRecord, isCookieName, isCookieValue } from '../_Parser.mjs';

function unquote(value) {
  if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
    const inner = value.slice(1, -1);

    return isCookieValue(inner) ? inner : undefined;
  }

  return isCookieValue(value) ? value : undefined;
}

export function parseCookieHeader(header) {
  const recordList = [];

  for (const part of header.split(';')) {
    const pair = part.trim();
    const index = pair.indexOf('=');

    if (index < 1) {
      continue;
    }

    const name = pair.slice(0, index).trim();

    if (!isCookieName(name) || name.startsWith('$')) {
      continue;
    }

    const value = unquote(pair.slice(index + 1).trim());

    if (value === undefined) {
      continue;
    }

    recordList.push({ name, value });
  }

  return recordList;
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
