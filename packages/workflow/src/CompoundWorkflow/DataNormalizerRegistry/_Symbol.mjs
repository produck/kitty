import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_NORMALIZER_MAP = Symbol('.#normalizerMap');

export const I = deepFreeze({
  NORMALIZER_MAP: I_NORMALIZER_MAP,
});

const $I_NORMALIZE = Symbol('.$normalize()');

export const $I = deepFreeze({
  NORMALIZE: $I_NORMALIZE,
});
