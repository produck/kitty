import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_PROGRESS = Symbol('.#progress');
const I_CONFIGURATION = Symbol('.#configuration');
const I_ENTRY = Symbol('.#entry');
const I_OPEN_ENTRY = Symbol('.#openEntry()');

export const I = deepFreeze({
  PROGRESS: I_PROGRESS,
  CONFIGURATION: I_CONFIGURATION,
  ENTRY: I_ENTRY,
  OPEN_ENTRY: I_OPEN_ENTRY,
});
