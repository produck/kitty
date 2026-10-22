import { Ow } from '@produck/argot';

export * from '../_Parser.mjs';

export function Throw(message, cause) {
  const throwArgs = [`Bad deployer: ${message}`];

  if (cause !== undefined) {
    throwArgs.push({ cause });
  }

  Ow.Error.Common(...throwArgs);
}
