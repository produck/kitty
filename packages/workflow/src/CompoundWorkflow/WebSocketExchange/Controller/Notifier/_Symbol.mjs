import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_LISTENER = Symbol('.#listener');

export const I = deepFreeze({
  LISTENER: I_LISTENER,
});
