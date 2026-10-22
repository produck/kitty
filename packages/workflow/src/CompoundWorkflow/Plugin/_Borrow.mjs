import { deepFreeze } from '@produck/deep-freeze-enumerable';

import * as COMPOUND_WORKFLOW from '../_Symbol.mjs';

export * as WORKFLOW from '../../Workflow/_Symbol.mjs';
export { COMPOUND_WORKFLOW };

export const _A = deepFreeze({
  COMPOUND: COMPOUND_WORKFLOW,
});
