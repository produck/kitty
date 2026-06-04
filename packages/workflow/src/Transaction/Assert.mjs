import { ThrowTypeError } from '@produck/type-error';

export function Iterable(value) {
  if (value == null || typeof value[Symbol.iterator] !== 'function') {
    ThrowTypeError('member', 'iterable');
  }

  return value;
}
