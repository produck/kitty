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
