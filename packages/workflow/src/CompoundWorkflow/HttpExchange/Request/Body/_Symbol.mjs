import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_DISTRIBUTOR = Symbol('.#distributor');
const I_MAX_BODY_SIZE = Symbol('.#maxBodySize()');

export const I = deepFreeze({
  DISTRIBUTOR: I_DISTRIBUTOR,
  MAX_BODY_SIZE: I_MAX_BODY_SIZE,
});

const _I_SOURCE_GET = Symbol('._getSource()');

export const _I = deepFreeze({
  SOURCE: {
    GET: _I_SOURCE_GET,
  },
});
