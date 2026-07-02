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

export function Iterable(value) {
  if (value == null || typeof value[Symbol.iterator] !== 'function') {
    ThrowTypeError('member', 'iterable');
  }

  return value;
}
