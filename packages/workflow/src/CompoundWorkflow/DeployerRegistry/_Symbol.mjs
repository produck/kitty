import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_REGISTRY = Symbol('.#registry');
const I_INSTANCE_MAP = Symbol('.#instanceMap');

const $I_RESOLVE = Symbol('.$resolve()');
const $I_ASSOCIATE = Symbol('.$associate()');

export const I = deepFreeze({
  REGISTRY: I_REGISTRY,
  INSTANCE_MAP: I_INSTANCE_MAP,
});

export const $I = deepFreeze({
  RESOLVE: $I_RESOLVE,
  ASSOCIATE: $I_ASSOCIATE,
});
