import * as Ow from '@produck/ow';

export * as Artifact from './Artifact.mjs';
export * as Registry from './Registry.mjs';

export function Throw(message, cause) {
  const throwArgs = [`Bad adapter: ${message}`];

  if (cause !== undefined) {
    throwArgs.push({ cause });
  }

  Ow.Error.Common(...throwArgs);
}
