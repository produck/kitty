import { deepFreeze } from '@produck/deep-freeze-enumerable';

const _I_GET = Symbol('._get(key)');
const _I_KEYS = Symbol('._keys()');

export const _I = deepFreeze({
  GET: _I_GET,
  KEYS: _I_KEYS,
});
