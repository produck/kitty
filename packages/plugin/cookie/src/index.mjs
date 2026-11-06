import { deepFreeze } from '@produck/deep-freeze-enumerable';

import { _I as COOKIE_I } from './Cookie/index.mjs';

export { Abstract as Cookie } from './Cookie/index.mjs';
export { Concrete as CookieParser } from './CookieParser/index.mjs';

export const SYMBOL = deepFreeze({
  COOKIE: {
    _I: COOKIE_I,
  },
});
