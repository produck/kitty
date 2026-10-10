import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_HEADER = Symbol('.#header');
const I_BODY = Symbol('.#body');

export const I = deepFreeze({
  HEADER: I_HEADER,
  BODY: I_BODY,
});

const _I_STATUS_GET = Symbol('._getStatus()');
const _I_STATUS_SET = Symbol('._setStatus()');
const _I_STATUS_TEXT_GET = Symbol('._getStatusText()');
const _I_STATUS_TEXT_SET = Symbol('._setStatusText()');
const _I_IS_FINISHED = Symbol('._isFinished()');

export const _I = deepFreeze({
  STATUS: {
    GET: _I_STATUS_GET,
    SET: _I_STATUS_SET,
  },
  STATUS_TEXT: {
    GET: _I_STATUS_TEXT_GET,
    SET: _I_STATUS_TEXT_SET,
  },
  IS_FINISHED: _I_IS_FINISHED,
});

const _S_HEADER_CTOR = Symbol('._headerCtor');
const _S_BODY_CTOR = Symbol('._bodyCtor');

export const _S = deepFreeze({
  HEADER_CTOR: _S_HEADER_CTOR,
  BODY_CTOR: _S_BODY_CTOR,
});
