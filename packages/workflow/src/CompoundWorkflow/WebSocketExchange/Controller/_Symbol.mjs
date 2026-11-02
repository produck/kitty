import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_UPGRADED = Symbol('.#upgraded');
const I_REJECTED = Symbol('.#rejected');
const I_ASSERT_PENDING = Symbol('.#assertPending()');
const I_ASSERT_UPGRADED = Symbol('.#assertUpgraded()');

const _I_GET_READY_STATE = Symbol('._getReadyState()');
const _I_HANDLE_UPGRADE = Symbol('._handleUpgrade()');
const _I_REJECT_UPGRADE = Symbol('._rejectUpgrade()');
const _I_SEND = Symbol('._send()');
const _I_CLOSE = Symbol('._close()');

export const I = deepFreeze({
  UPGRADED: I_UPGRADED,
  REJECTED: I_REJECTED,
  ASSERT: {
    PENDING: I_ASSERT_PENDING,
    UPGRADED: I_ASSERT_UPGRADED,
  },
});

export const _I = deepFreeze({
  GET_READY_STATE: _I_GET_READY_STATE,
  HANDLE_UPGRADE: _I_HANDLE_UPGRADE,
  REJECT_UPGRADE: _I_REJECT_UPGRADE,
  SEND: _I_SEND,
  CLOSE: _I_CLOSE,
});
