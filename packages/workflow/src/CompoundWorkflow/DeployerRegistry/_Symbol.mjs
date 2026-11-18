import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_REGISTRY = Symbol('.#registry');

const $I_RESOLVE = Symbol('.$resolve()');

export const I = deepFreeze({
  REGISTRY: I_REGISTRY,
});

export const $I = deepFreeze({
  RESOLVE: $I_RESOLVE,
});
