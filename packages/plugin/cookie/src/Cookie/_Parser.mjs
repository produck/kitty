export * from '../_Parser.mjs';

import { Is, ThrowTypeError } from '@produck/argot';

const COOKIE_NAME = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
const COOKIE_OCTETS = /^[\x21\x23-\x2b\x2d-\x3a\x3c-\x5b\x5d-\x7e]*$/;

function isCookieName(value) {
  return COOKIE_NAME.test(value);
}

function isCookieValue(value) {
  return COOKIE_OCTETS.test(value);
}

export function CookieName(value) {
  if (!Is.Type.String(value) || !isCookieName(value)) {
    ThrowTypeError('member', 'a cookie name token');
  }

  return value;
}

export function CookieValue(value) {
  if (!Is.Type.String(value) || !isCookieValue(value)) {
    ThrowTypeError('member', 'a cookie value of cookie-octet characters');
  }

  return value;
}

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
