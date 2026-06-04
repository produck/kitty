import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_CONSTRUCTOR = Symbol('.#constructor');

export const I = deepFreeze({
  CONSTRUCTOR: I_CONSTRUCTOR,
});

const _I_INTERNAL = Symbol('._internal');
const _I_METHOD_GET = Symbol('._getMethod()');
const _I_URL_GET = Symbol('._getURL()');
const _I_STATUS_GET = Symbol('._getStatus()');
const _I_STATUS_SET = Symbol('._setStatus()');
const _I_IS_FINISHED_GET = Symbol('._isFinished');
const _I_REQUEST_GET = Symbol('._getRequest()');
const _I_RESPONSE_GET = Symbol('._getResponse()');

export const _I = deepFreeze({
  INTERNAL: _I_INTERNAL,
  METHOD: {
    GET: _I_METHOD_GET,
  },
  URL: {
    GET: _I_URL_GET,
  },
  STATUS: {
    GET: _I_STATUS_GET,
    SET: _I_STATUS_SET,
  },
  FINISHED: {
    IS: _I_IS_FINISHED_GET,
  },
  REQUEST: {
    GET: _I_REQUEST_GET,
  },
  RESPONSE: {
    GET: _I_RESPONSE_GET,
  },
});

export const S = deepFreeze({});

export const _S = deepFreeze({});
