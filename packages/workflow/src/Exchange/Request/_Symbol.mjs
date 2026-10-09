import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_EXCHANGE = Symbol('.#exchange');
const I_BODY_PROGRESS = Symbol('.#requestBodyProgress');
const I_BODY_CONFIGURATION = Symbol('.#requestBodyConfiguration');
const I_BODY_ENTRY = Symbol('.#requestBodyEntry');
const I_BODY_OPEN_ENTRY = Symbol('.#openRequestBodyEntry()');

export const I = deepFreeze({
  EXCHANGE: I_EXCHANGE,
  BODY: {
    PROGRESS: I_BODY_PROGRESS,
    CONFIGURATION: I_BODY_CONFIGURATION,
    ENTRY: I_BODY_ENTRY,
    OPEN_ENTRY: I_BODY_OPEN_ENTRY,
  },
});
