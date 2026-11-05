import { Is, ThrowTypeError } from '@produck/argot';

export * from '../_Parser.mjs';

const HTTP_VERSIONS = Object.freeze(['1.0', '1.1', '2.0', '3.0']);
const VERSIONS_TAG = HTTP_VERSIONS.map((v) => `'${v}'`).join(' | ');

export function HttpVersion(value) {
  if (value === null) {
    return null;
  }

  if (!Is.Type.String(value) || !HTTP_VERSIONS.includes(value)) {
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
  if (!Is.Iterable(value)) {
    ThrowTypeError('member', 'iterable');
  }

  return value;
}

const PROTOCOLS = Object.freeze(['http:', 'https:']);
const PROTOCOLS_TAG = PROTOCOLS.map((v) => `'${v}'`).join(' | ');

export function ServerProtocol(value) {
  if (!Is.Type.String(value) || !PROTOCOLS.includes(value)) {
    ThrowTypeError('member', `a server protocol (${PROTOCOLS_TAG})`);
  }

  return value;
}

export function HeaderName(value) {
  if (!Is.Type.String(value) || value.length === 0) {
    ThrowTypeError('member', 'a non-empty header name string');
  }

  return value;
}

export function HeaderValue(value) {
  if (!Is.Type.String(value)) {
    ThrowTypeError('member', 'a header value string');
  }

  return value;
}

export function HeaderValueOrUndefined(value) {
  if (value !== undefined && !Is.Type.String(value)) {
    ThrowTypeError('member', 'a header value string or undefined');
  }

  return value;
}

export function HeaderValuesOrUndefined(value) {
  if (
    value !== undefined &&
    !Is.Type.String(value) &&
    (!Array.isArray(value) || !value.every((item) => Is.Type.String(item)))
  ) {
    ThrowTypeError(
      'member',
      'a header value string, a string list or undefined',
    );
  }

  return value;
}
