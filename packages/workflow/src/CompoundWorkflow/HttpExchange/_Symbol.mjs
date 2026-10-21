import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_START_TIMING = Symbol('.#startTiming()');

export const I = deepFreeze({
  START_TIMING: I_START_TIMING,
});
