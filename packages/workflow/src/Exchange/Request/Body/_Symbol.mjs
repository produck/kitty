import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_DISTRIBUTOR = Symbol('.#distributor');
const I_DISTRIBUTOR_CTOR = Symbol('.#distributorCtor');

export const I = deepFreeze({
  DISTRIBUTOR: I_DISTRIBUTOR,
  DISTRIBUTOR_CTOR: I_DISTRIBUTOR_CTOR,
});

const _I_SOURCE_GET = Symbol('._getSource()');

export const _I = deepFreeze({
  SOURCE: {
    GET: _I_SOURCE_GET,
  },
});

export const A = deepFreeze({
  I: {
    DISTRIBUTOR_CTOR: I_DISTRIBUTOR_CTOR,
  },
});
