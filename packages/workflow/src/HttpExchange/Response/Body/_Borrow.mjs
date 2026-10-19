import { deepFreeze } from '@produck/deep-freeze-enumerable';

import * as DATA_NORMALIZER_REGISTRY from '../../../Workflow/DataNormalizerRegistry/_Symbol.mjs';
export * as WORKFLOW from '../../../Workflow/_Symbol.mjs';
export * as PART from '../../../Exchange/Part/_Symbol.mjs';

export const _A = deepFreeze({
  REGISTRY: DATA_NORMALIZER_REGISTRY,
});

export { DATA_NORMALIZER_REGISTRY };
