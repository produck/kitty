import { METHODS } from 'node:http';

import { Is, ThrowTypeError } from '@produck/argot';

export function HttpMethod(value) {
  if (!Is.Type.String(value) || !METHODS.includes(value)) {
    ThrowTypeError('member', 'a HTTP method');
  }

  return value;
}

export function Handler(value, index) {
  if (!Is.Type.Function(value) || value.length > 2) {
    ThrowTypeError(`args[${index}] as handler`, '([kit[, next]]) => any');
  }

  return value;
}
