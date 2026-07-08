import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_CONSTRUCTOR = Symbol('.#constructor');
const I_EXCHANGE = Symbol('.#exchange');
const I_KIT = Symbol('.#kit');

export const I = deepFreeze({
  CONSTRUCTOR: I_CONSTRUCTOR,
  EXCHANGE: I_EXCHANGE,
  KIT: I_KIT,
});

const $I_INTERNAL = Symbol('.$internal');
const _I_IDENTITY_GET = Symbol('._getIdentity()');
const _I_SERVER_GET = Symbol('._getServer()');
const _I_SERVER_PROTOCOL_GET = Symbol('._getServerProtocol()');
const _I_HTTP_VERSION_GET = Symbol('._getHttpVersion()');
const _I_STATUS_GET = Symbol('._getStatus()');
const _I_STATUS_SET = Symbol('._setStatus()');
const _I_REQ_IS_CONSUMED = Symbol('._isRequestConsumed()');
const _I_REQ_MODE_GET = Symbol('._getRequestMode()');
const _I_REQ_METHOD_GET = Symbol('._getRequestMethod()');
const _I_REQ_URL_GET = Symbol('._getRequestURL()');
const _I_REQ_HEADER_GET = Symbol('._getRequestHeader(key)');
const _I_REQ_HEADER_KEYS = Symbol('._getRequestHeaderKeys()');
const _I_REQ_BODY_DATA_GET = Symbol('._getRequestBodyData()');
const _I_RES_HEADER_GET = Symbol('._getResponseHeader(key)');
const _I_RES_IS_FINISHED = Symbol('._isResponseFinished()');
const _I_RES_HEADER_KEYS = Symbol('._getResponseHeaderKeys()');
const _I_RES_HEADER_SET = Symbol('._setResponseHeader(key, value)');
const _I_RES_HEADER_DELETE = Symbol('._deleteResponseHeader(key)');
const _I_RES_STATUS_TEXT_GET = Symbol('._getResponseStatusText()');
const _I_RES_STATUS_TEXT_SET = Symbol('._setResponseStatusText(text)');
const _I_RES_BODY_DATA_GET = Symbol('._getResponseBodyData()');
const _I_RES_BODY_DATA_SET = Symbol('._setResponseBodyData(data)');

export const _I = deepFreeze({
  IDENTITY: {
    GET: _I_IDENTITY_GET,
  },
  SERVER: {
    GET: _I_SERVER_GET,
    PROTOCOL: {
      GET: _I_SERVER_PROTOCOL_GET,
    },
  },
  HTTP_VERSION: {
    GET: _I_HTTP_VERSION_GET,
  },
  STATUS: {
    GET: _I_STATUS_GET,
    SET: _I_STATUS_SET,
  },
  REQUEST: {
    MODE: {
      GET: _I_REQ_MODE_GET,
    },
    METHOD: {
      GET: _I_REQ_METHOD_GET,
    },
    URL: {
      GET: _I_REQ_URL_GET,
    },
    HEADER: {
      GET: _I_REQ_HEADER_GET,
      KEYS: _I_REQ_HEADER_KEYS,
    },
    BODY: {
      DATA: {
        GET: _I_REQ_BODY_DATA_GET,
      },
    },
    IS_CONSUMED: _I_REQ_IS_CONSUMED,
  },
  RESPONSE: {
    HEADER: {
      GET: _I_RES_HEADER_GET,
      KEYS: _I_RES_HEADER_KEYS,
      SET: _I_RES_HEADER_SET,
      DELETE: _I_RES_HEADER_DELETE,
    },
    STATUS_TEXT: {
      GET: _I_RES_STATUS_TEXT_GET,
      SET: _I_RES_STATUS_TEXT_SET,
    },
    BODY: {
      DATA: {
        GET: _I_RES_BODY_DATA_GET,
        SET: _I_RES_BODY_DATA_SET,
      },
    },
    IS_FINISHED: _I_RES_IS_FINISHED,
  },
});

export const $I = deepFreeze({
  INTERNAL: $I_INTERNAL,
});

export const S = deepFreeze({});

export const _S = deepFreeze({});
