import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_EXCHANGE = Symbol('.#exchange');
const I_TYPE_TABLE = Symbol('.#typeTable');
const I_SPEC_LIST = Symbol('.#specList()');
const I_FORM_LIST = Symbol('.#formList()');
const I_QUALITY = Symbol('.#quality()');
const I_MATCH = Symbol('.#match()');
const I_BEST = Symbol('.#best()');
const I_ASSERT = Symbol('.#assert()');

export const I = deepFreeze({
  EXCHANGE: I_EXCHANGE,
  TYPE_TABLE: I_TYPE_TABLE,
  SPEC_LIST: I_SPEC_LIST,
  FORM_LIST: I_FORM_LIST,
  QUALITY: I_QUALITY,
  MATCH: I_MATCH,
  BEST: I_BEST,
  ASSERT: I_ASSERT,
});
