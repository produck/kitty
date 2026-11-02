import { deepFreeze } from '@produck/deep-freeze-enumerable';

const $I_HANDLE_UPGRADE = Symbol('.$handleUpgrade()');

const _I_GET_READY_STATE = Symbol('._getReadyState()');
const _I_HANDLE_UPGRADE = Symbol('._handleUpgrade()');
const _I_SEND = Symbol('._send()');
const _I_CLOSE = Symbol('._close()');

export const $I = deepFreeze({
  HANDLE_UPGRADE: $I_HANDLE_UPGRADE,
});

export const _I = deepFreeze({
  GET_READY_STATE: _I_GET_READY_STATE,
  HANDLE_UPGRADE: _I_HANDLE_UPGRADE,
  SEND: _I_SEND,
  CLOSE: _I_CLOSE,
});
