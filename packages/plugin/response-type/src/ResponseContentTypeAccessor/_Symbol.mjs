import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_EXCHANGE = Symbol('.#exchange');
const I_TYPE_TABLE = Symbol('.#typeTable');
const I_CHARSET = Symbol('.#charset');
const I_WRITE = Symbol('.#write()');
const I_RESOLVE_ITEM = Symbol('.#resolveItem()');
const I_RESOLVE_CHARSET = Symbol('.#resolveCharset()');

export const I = deepFreeze({
  EXCHANGE: I_EXCHANGE,
  TYPE_TABLE: I_TYPE_TABLE,
  CHARSET: I_CHARSET,
  WRITE: I_WRITE,
  RESOLVE_ITEM: I_RESOLVE_ITEM,
  RESOLVE_CHARSET: I_RESOLVE_CHARSET,
});
