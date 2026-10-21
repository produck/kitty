import { ThrowTypeError } from '@produck/argot';

export function Attacher(value) {
  if (typeof value !== 'function') {
    ThrowTypeError('args[0] as attacher', 'function');
  }

  return value;
}
