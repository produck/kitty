import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_DATA = Symbol('.#data');

export const I = deepFreeze({
  DATA: I_DATA,
});

const _I_DATA_SET = Symbol('._setData(value)');

export const _I = deepFreeze({
  DATA: {
    SET: _I_DATA_SET,
  },
});
