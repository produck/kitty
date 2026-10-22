import { deepFreeze } from '@produck/deep-freeze-enumerable';

const _I_STATUS_SET = Symbol('._setStatus()');
const _I_STATUS_TEXT_SET = Symbol('._setStatusText()');

export const _I = deepFreeze({
  STATUS: {
    SET: _I_STATUS_SET,
  },
  STATUS_TEXT: {
    SET: _I_STATUS_TEXT_SET,
  },
});
