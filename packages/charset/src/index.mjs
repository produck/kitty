import { deepFreeze } from '@produck/deep-freeze-enumerable';

import * as SELECTOR from './Selector/_Symbol.mjs';

export { default as Selector } from './Selector/index.mjs';

export const SYMBOL = deepFreeze({
  SELECTOR: {
    _I: SELECTOR._I,
  },
});
