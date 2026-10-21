import { METHODS } from 'node:http';

import { ThrowTypeError } from '@produck/argot';

export function HttpMethod(value) {
  if (typeof value !== 'string' || !METHODS.includes(value)) {
    ThrowTypeError('member', 'a HTTP method');
  }

  return value;
}
