import { Is, ThrowTypeError } from '@produck/argot';

import * as P from '../_Parser.mjs';

export * from '../_Parser.mjs';

export function HttpMethodList(value) {
  if (!Is.Instance.Array(value)) {
    ThrowTypeError('member', 'an array of HTTP methods');
  }

  for (const method of value) {
    P.HttpMethod(method);
  }

  return Object.freeze([...value]);
}

export function PositiveInteger(value) {
  if (!Is.PositiveInteger(value)) {
    ThrowTypeError('member', 'a positive integer');
  }

  return value;
}

export function NonNegativeInteger(value) {
  if (!Is.NonNegativeInteger(value)) {
    ThrowTypeError('member', 'a non-negative integer');
  }

  return value;
}

export function NonNegativeIntegerOrInfinity(value) {
  if (value !== Infinity && !Is.NonNegativeInteger(value)) {
    ThrowTypeError('member', 'a non-negative integer or Infinity');
  }

  return value;
}

export function Boolean(value) {
  if (!Is.Type.Boolean(value)) {
    ThrowTypeError('member', 'a boolean');
  }

  return value;
}

export function HighWaterMark(value) {
  if (!Is.NonNegativeNumber(value)) {
    ThrowTypeError('member', 'a non-negative number');
  }

  return value;
}
