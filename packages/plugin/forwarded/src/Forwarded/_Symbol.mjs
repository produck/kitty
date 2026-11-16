import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_EXCHANGE = Symbol('.#exchange');
const I_ENTRY_LIST = Symbol('.#entryList()');
const I_CLIENT = Symbol('.#client()');
const I_PROTOCOL = Symbol('.#protocol()');
const I_REMOTE = Symbol('.#remote()');

export const I = deepFreeze({
  EXCHANGE: I_EXCHANGE,
  ENTRY_LIST: I_ENTRY_LIST,
  CLIENT: I_CLIENT,
  PROTOCOL: I_PROTOCOL,
  REMOTE: I_REMOTE,
});
