import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_UPGRADED = Symbol('.#upgraded');
const I_ASSERT_NOT_UPGRADED = Symbol('.#assertNotUpgraded()');
const I_ASSERT_UPGRADED = Symbol('.#assertUpgraded()');

const $I_HANDLE_UPGRADE = Symbol('.$handleUpgrade()');

const _I_GET_READY_STATE = Symbol('._getReadyState()');
const _I_HANDLE_UPGRADE = Symbol('._handleUpgrade()');
const _I_SEND = Symbol('._send()');
const _I_CLOSE = Symbol('._close()');

export const I = deepFreeze({
  UPGRADED: I_UPGRADED,
  ASSERT: {
    NOT_UPGRADED: I_ASSERT_NOT_UPGRADED,
    UPGRADED: I_ASSERT_UPGRADED,
  },
});

export const $I = deepFreeze({
  HANDLE_UPGRADE: $I_HANDLE_UPGRADE,
});

export const _I = deepFreeze({
  GET_READY_STATE: _I_GET_READY_STATE,
  HANDLE_UPGRADE: _I_HANDLE_UPGRADE,
  SEND: _I_SEND,
  CLOSE: _I_CLOSE,
});
