import { deepFreeze } from '@produck/deep-freeze-enumerable';

const _I_SET = Symbol('._set()');
const _I_APPEND = Symbol('._append()');
const _I_DELETE = Symbol('._delete()');

export const _I = deepFreeze({
  SET: _I_SET,
  APPEND: _I_APPEND,
  DELETE: _I_DELETE,
});
