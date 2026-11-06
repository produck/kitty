import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_ENTRY_MAP = Symbol('.#entryMap');

export const I = deepFreeze({
  ENTRY_MAP: I_ENTRY_MAP,
});
