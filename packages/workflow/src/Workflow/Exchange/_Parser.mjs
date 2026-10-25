import { ThrowTypeError } from '@produck/argot';

export * from '../_Parser.mjs';

const HTTP_VERSIONS = Object.freeze(['1.0', '1.1', '2.0', '3.0']);
const VERSIONS_TAG = HTTP_VERSIONS.map((v) => `'${v}'`).join(' | ');

export function HttpVersion(value) {
  if (value === null) {
    return null;
  }

  if (typeof value !== 'string' || !HTTP_VERSIONS.includes(value)) {
    ThrowTypeError('member', `'${VERSIONS_TAG}' | null`);
  }

  return value;
}

export function HTTPStatusCode(value) {
  if (!Number.isInteger(value) || value < 100 || value > 599) {
    ThrowTypeError('member', 'a HTTP status code (integer 100..599)');
  }

  return value;
}

export function Iterable(value) {
  if (value == null || typeof value[Symbol.iterator] !== 'function') {
    ThrowTypeError('member', 'iterable');
  }

  return value;
}

const PROTOCOLS = Object.freeze(['http:', 'https:']);
const PROTOCOLS_TAG = PROTOCOLS.map((v) => `'${v}'`).join(' | ');

export function ServerProtocol(value) {
  if (typeof value !== 'string' || !PROTOCOLS.includes(value)) {
    ThrowTypeError('member', `a server protocol (${PROTOCOLS_TAG})`);
  }

  return value;
}

export function HeaderName(value) {
  if (typeof value !== 'string' || value.length === 0) {
    ThrowTypeError('member', 'a non-empty header name string');
  }

  return value;
}

export function HeaderValue(value) {
  if (typeof value !== 'string') {
    ThrowTypeError('member', 'a header value string');
  }

  return value;
}

export function HeaderValueOrUndefined(value) {
  if (value !== undefined && typeof value !== 'string') {
    ThrowTypeError('member', 'a header value string or undefined');
  }

  return value;
}
