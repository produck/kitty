import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_EXCHANGE = Symbol('.#exchange');
const I_CHARSET = Symbol('.#charset');
const I_ACCEPT_CHARSET = Symbol('.#acceptCharset()');
const I_SPEC_LIST = Symbol('.#specList()');
const I_QUALITY = Symbol('.#quality()');

export const I = deepFreeze({
  EXCHANGE: I_EXCHANGE,
  CHARSET: I_CHARSET,
  ACCEPT_CHARSET: I_ACCEPT_CHARSET,
  SPEC_LIST: I_SPEC_LIST,
  QUALITY: I_QUALITY,
});
