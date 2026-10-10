import { deepFreeze } from '@produck/deep-freeze-enumerable';

const _I_DATA_GET = Symbol('._getData()');

export const _I = deepFreeze({
  DATA: {
    GET: _I_DATA_GET,
  },
});
