import { deepFreeze } from '@produck/deep-freeze-enumerable';

const _I_GET = Symbol('._get(key)');
const _I_KEYS = Symbol('._keys()');
const _I_SET = Symbol('._set(key, value)');
const _I_DELETE = Symbol('._delete(key)');

export const _I = deepFreeze({
  GET: _I_GET,
  KEYS: _I_KEYS,
  SET: _I_SET,
  DELETE: _I_DELETE,
});
