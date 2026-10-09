import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_EXCHANGE = Symbol('.#exchange');

export const I = deepFreeze({
  EXCHANGE: I_EXCHANGE,
});
