import { METHODS } from 'node:http';

import { ThrowTypeError } from '@produck/argot';

export function HttpMethod(value) {
  if (typeof value !== 'string' || !METHODS.includes(value)) {
    ThrowTypeError('member', 'a HTTP method');
  }

  return value;
}

export function Handler(value, index) {
  if (typeof value !== 'function' || value.length > 2) {
    ThrowTypeError(`args[${index}] as handler`, '([kit[, next]]) => any');
  }

  return value;
}
