import { METHODS } from 'node:http';
import { ThrowTypeError } from '@produck/type-error';

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

export function HttpMethod(value) {
  if (typeof value !== 'string' || !METHODS.includes(value)) {
    ThrowTypeError('member', 'a HTTP method');
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
