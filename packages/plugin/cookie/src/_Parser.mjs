import { Is, ThrowTypeError } from '@produck/argot';

const COOKIE_NAME = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
const COOKIE_OCTETS = /^[\x21\x23-\x2b\x2d-\x3a\x3c-\x5b\x5d-\x7e]*$/;

export function isCookieName(value) {
  return COOKIE_NAME.test(value);
}

export function isCookieValue(value) {
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

export function CookieRecord(value) {
  if (!Is.Type.Object(value) || value === null) {
    ThrowTypeError('member', 'a cookie record');
  }

  CookieName(value.name);
  CookieValue(value.value);

  return value;
}
