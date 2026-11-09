import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_RECORD_LIST = Symbol('.#recordList');

const $I_REGISTER = Symbol('.$register()');

export const I = deepFreeze({
  RECORD_LIST: I_RECORD_LIST,
});

export const $I = deepFreeze({
  REGISTER: $I_REGISTER,
});
