import { deepFreeze } from '@produck/deep-freeze-enumerable';

const _I_READY_STATE_GET = Symbol('._getReadyState()');
const _I_SEND = Symbol('._send()');
const _I_CLOSE = Symbol('._close()');

export const _I = deepFreeze({
  READY_STATE: {
    GET: _I_READY_STATE_GET,
  },
  SEND: _I_SEND,
  CLOSE: _I_CLOSE,
});
