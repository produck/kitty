import { ThrowTypeError } from '@produck/type-error';

export function assertHandlerByIndex(value, index) {
  if (typeof value !== 'function' || value.length > 2) {
    ThrowTypeError(`args[${index}] as handler`, '([kit[, next]]) => any');
  }
}
