import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_DISTRIBUTOR = Symbol('.#distributor');

export const I = deepFreeze({
  DISTRIBUTOR: I_DISTRIBUTOR,
});

const _I_SOURCE_GET = Symbol('._getSource()');

export const _I = deepFreeze({
  SOURCE: {
    GET: _I_SOURCE_GET,
  },
});

const _S_DISTRIBUTOR_CTOR = Symbol('._distributorCtor');

export const _S = deepFreeze({
  DISTRIBUTOR_CTOR: _S_DISTRIBUTOR_CTOR,
});
