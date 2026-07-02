import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_CONSTRUCTOR = Symbol('.#constructor');
const I_EXCHANGE = Symbol('.#exchange');

export const I = deepFreeze({
  CONSTRUCTOR: I_CONSTRUCTOR,
  EXCHANGE: I_EXCHANGE,
});

const _I_INTERNAL = Symbol('._internal');
const _I_IDENTITY_GET = Symbol('._getIdentity()');
const _I_SERVER_GET = Symbol('._getServer()');
const _I_MODE_GET = Symbol('._getMode()');
const _I_HTTP_VERSION_GET = Symbol('._getHttpVersion()');
const _I_METHOD_GET = Symbol('._getMethod()');
const _I_URL_GET = Symbol('._getURL()');
const _I_STATUS_GET = Symbol('._getStatus()');
const _I_STATUS_SET = Symbol('._setStatus()');
const _I_IS_FINISHED = Symbol('._isFinished()');
const _I_REQ_HEADER_GET = Symbol('._getRequestHeader(key)');
const _I_REQ_HEADER_KEYS = Symbol('._getRequestHeaderKeys()');
const _I_REQ_BODY_DATA_GET = Symbol('._getRequestBodyData()');
const _I_RES_HEADER_GET = Symbol('._getResponseHeader(key)');
const _I_RES_HEADER_KEYS = Symbol('._getResponseHeaderKeys()');
const _I_RES_HEADER_SET = Symbol('._setResponseHeader(key, value)');
const _I_RES_HEADER_DELETE = Symbol('._deleteResponseHeader(key)');
const _I_RES_BODY_DATA_GET = Symbol('._getResponseBodyData()');
const _I_RES_BODY_DATA_SET = Symbol('._setResponseBodyData(data)');

export const _I = deepFreeze({
  INTERNAL: _I_INTERNAL,
  IDENTITY: {
    GET: _I_IDENTITY_GET,
  },
  SERVER: {
    GET: _I_SERVER_GET,
  },
  MODE: {
    GET: _I_MODE_GET,
  },
  HTTP_VERSION: {
    GET: _I_HTTP_VERSION_GET,
  },
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
    IS: _I_IS_FINISHED,
  },
  REQUEST: {
    HEADER: {
      GET: _I_REQ_HEADER_GET,
      KEYS: _I_REQ_HEADER_KEYS,
    },
    BODY: {
      DATA: {
        GET: _I_REQ_BODY_DATA_GET,
      },
    },
  },
  RESPONSE: {
    HEADER: {
      GET: _I_RES_HEADER_GET,
      KEYS: _I_RES_HEADER_KEYS,
      SET: _I_RES_HEADER_SET,
      DELETE: _I_RES_HEADER_DELETE,
    },
    BODY: {
      DATA: {
        GET: _I_RES_BODY_DATA_GET,
        SET: _I_RES_BODY_DATA_SET,
      },
    },
  },
});

export const S = deepFreeze({});

export const _S = deepFreeze({});
