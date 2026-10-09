import { ThrowTypeError } from '@produck/type-error';

export function assertInstaller(value) {
  if (typeof value !== 'function') {
    ThrowTypeError('args[0] as installer', 'function');
  }
}

export function defineMixin(installer) {
  assertInstaller(installer);

  return installer;
}
