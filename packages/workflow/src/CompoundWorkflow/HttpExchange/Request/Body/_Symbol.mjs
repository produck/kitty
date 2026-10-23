import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_READABLE = Symbol('.#readable');
const I_DISTRIBUTOR = Symbol('.#distributor');
const I_INIT_READABLE_EVENT = Symbol('.#initReadableEvent()');
const I_INIT_DISTRIBUTOR = Symbol('.#initDistributor()');
const I_INIT_MAX_BODY_SIZE = Symbol('.#initMaxBodySize()');

export const I = deepFreeze({
  READABLE: I_READABLE,
  DISTRIBUTOR: I_DISTRIBUTOR,
  INIT: {
    READABLE_EVENT: I_INIT_READABLE_EVENT,
    DISTRIBUTOR: I_INIT_DISTRIBUTOR,
    MAX_BODY_SIZE: I_INIT_MAX_BODY_SIZE,
  },
});

const _I_SOURCE_GET = Symbol('._getSource()');

export const _I = deepFreeze({
  SOURCE: {
    GET: _I_SOURCE_GET,
  },
});
