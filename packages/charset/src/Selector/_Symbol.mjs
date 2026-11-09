import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_IANA = Symbol('.#iana()');
const I_ENTRIES = Symbol('.#entries');
const _I_EXTEND = Symbol('._extend()');

export const I = deepFreeze({
  IANA: I_IANA,
  ENTRIES: I_ENTRIES,
});

export const _I = deepFreeze({
  EXTEND: _I_EXTEND,
});
