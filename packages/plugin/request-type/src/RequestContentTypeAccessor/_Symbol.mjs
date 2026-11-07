import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_EXCHANGE = Symbol('.#exchange');
const I_TYPE_TABLE = Symbol('.#typeTable');
const I_PARSED_MEDIA_TYPE = Symbol('.#parsedMediaType');
const I_MATCH = Symbol('.#match()');

export const I = deepFreeze({
  EXCHANGE: I_EXCHANGE,
  TYPE_TABLE: I_TYPE_TABLE,
  PARSED_MEDIA_TYPE: I_PARSED_MEDIA_TYPE,
  MATCH: I_MATCH,
});
