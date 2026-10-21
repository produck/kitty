import { ThrowTypeError } from '@produck/argot';

export function assertInstaller(value) {
  if (typeof value !== 'function') {
    ThrowTypeError('args[0] as installer', 'function');
  }
}

export function defineMixin(installer) {
  assertInstaller(installer);

  return installer;
}
