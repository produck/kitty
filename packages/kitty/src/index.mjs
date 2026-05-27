import { ThrowTypeError } from '@produck/type-error';
import * as Kit from '@produck/kit';

import { Generator } from './Generator.mjs';

export function Kitty(kit = Kit.global) {
  if (!Kit.isKit(kit)) {
    ThrowTypeError('args[0] as kit', 'Kit');
  }

  return new Generator(kit);
}
