import { deepFreeze } from '@produck/deep-freeze-enumerable';

const _I_DATA_GET = Symbol('._getData()');
const _I_DATA_SET = Symbol('._setData(value)');

export const _I = deepFreeze({
  DATA: {
    GET: _I_DATA_GET,
    SET: _I_DATA_SET,
  },
});
