import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_PARSED = Symbol('.#parsed');

export const I = deepFreeze({
  PARSED: I_PARSED,
});

const $I_PARSED = Symbol('.$parsed');

export const $I = deepFreeze({
  PARSED: $I_PARSED,
});

const _I_READ = Symbol('._read()');
const _I_WRITE = Symbol('._write()');

export const _I = deepFreeze({
  READ: _I_READ,
  WRITE: _I_WRITE,
});
