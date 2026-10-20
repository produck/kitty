import { ThrowTypeError } from '@produck/argot';
import * as Kit from '@produck/kit';

export function Attacher(value) {
  if (typeof value !== 'function') {
    ThrowTypeError('args[0] as attacher', 'function');
  }

  return value;
}

export function DependenceName(value) {
  if (!Kit.isDependenceName(value)) {
    ThrowTypeError('args[0] as dependency name', 'string | symbol');
  }

  return value;
}
