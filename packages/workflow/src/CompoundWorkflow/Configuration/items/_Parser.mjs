import { ThrowTypeError } from '@produck/argot';

import * as P from '../_Parser.mjs';

export * from '../_Parser.mjs';

export function HttpMethodList(value) {
  if (!Array.isArray(value)) {
    ThrowTypeError('member', 'an array of HTTP methods');
  }

  for (const method of value) {
    P.HttpMethod(method);
  }

  return Object.freeze([...value]);
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

export function NonNegativeIntegerOrInfinity(value) {
  if (value !== Infinity && (!Number.isInteger(value) || value < 0)) {
    ThrowTypeError('member', 'a non-negative integer or Infinity');
  }

  return value;
}

export function Boolean(value) {
  if (typeof value !== 'boolean') {
    ThrowTypeError('member', 'a boolean');
  }

  return value;
}

export function HighWaterMark(value) {
  if (typeof value !== 'number' || Number.isNaN(value) || value < 0) {
    ThrowTypeError('member', 'a non-negative number');
  }

  return value;
}
