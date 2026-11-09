import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_IANA = Symbol('.#iana()');
const I_ITERATE = Symbol('.#iterate()');
const _I_EXTRA = Symbol('._extra()');

export const I = deepFreeze({
  IANA: I_IANA,
  ITERATE: I_ITERATE,
});

export const _I = deepFreeze({
  EXTRA: _I_EXTRA,
});
