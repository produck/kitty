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

const MODES = Object.freeze(['http', 'websocket']);
const MODES_TAG = MODES.map((v) => `'${v}'`).join(' | ');

export function ExchangeMode(value) {
  if (typeof value !== 'string' || !MODES.includes(value)) {
    ThrowTypeError('member', `a HTTP exchange mode (${MODES_TAG})`);
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

export function PositiveInteger(value) {
  if (!Number.isInteger(value) || value < 1) {
    ThrowTypeError('member', 'a positive integer');
  }

  return value;
}

export function NonNegativeInteger(value) {
  if (!Number.isInteger(value) || value < 0) {
    ThrowTypeError('member', 'a non-negative integer');
  }

  return value;
}

export function HttpMethodList(value) {
  if (!Array.isArray(value)) {
    ThrowTypeError('member', 'an array of HTTP methods');
  }

  for (const method of value) {
    HttpMethod(method);
  }

  return Object.freeze([...value]);
}
