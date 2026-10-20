import { Ow } from '@produck/argot';

export { default as Abstract } from './_Abstract.mjs';
export * as Artifact from './Artifact.mjs';
export * as ExchangeImplement from './ExchangeImplement/index.mjs';
export * as Registry from './Registry.mjs';

export function Throw(message, cause) {
  const throwArgs = [`Bad deployer: ${message}`];

  if (cause !== undefined) {
    throwArgs.push({ cause });
  }

  Ow.Error.Common(...throwArgs);
}
