import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_EXCHANGE = Symbol('.#exchange');
const I_TYPE_TABLE = Symbol('.#typeTable');
const I_ACCEPT = Symbol('.#accept()');
const I_ACCEPT_ENCODING = Symbol('.#acceptEncoding()');
const I_ACCEPT_LANGUAGE = Symbol('.#acceptLanguage()');
const I_SPEC_LIST = Symbol('.#specList()');
const I_FORM_LIST = Symbol('.#formList()');
const I_QUALITY = Symbol('.#quality()');
const I_SPECIFICITY = Symbol('.#specificity()');
const I_MATCH = Symbol('.#match()');
const I_BEST = Symbol('.#best()');

export const I = deepFreeze({
  EXCHANGE: I_EXCHANGE,
  TYPE_TABLE: I_TYPE_TABLE,
  ACCEPT: I_ACCEPT,
  ACCEPT_ENCODING: I_ACCEPT_ENCODING,
  ACCEPT_LANGUAGE: I_ACCEPT_LANGUAGE,
  SPEC_LIST: I_SPEC_LIST,
  FORM_LIST: I_FORM_LIST,
  QUALITY: I_QUALITY,
  SPECIFICITY: I_SPECIFICITY,
  MATCH: I_MATCH,
  BEST: I_BEST,
});
