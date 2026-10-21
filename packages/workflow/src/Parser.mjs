import { ThrowTypeError } from '@produck/argot';
import * as Kit from '@produck/kit';

export function DependenceName(value) {
  if (!Kit.isDependenceName(value)) {
    ThrowTypeError('args[0] as dependency name', 'string | symbol');
  }

  return value;
}
