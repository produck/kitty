import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_CONSTRUCTOR = Symbol('.#constructor');
const I_TRANSACTION = Symbol('.#transaction');

export const I = deepFreeze({
  CONSTRUCTOR: I_CONSTRUCTOR,
  TRANSACTION: I_TRANSACTION,
});

const _I_INTERNAL = Symbol('._internal');
const _I_METHOD_GET = Symbol('._getMethod()');
const _I_URL_GET = Symbol('._getURL()');
const _I_STATUS_GET = Symbol('._getStatus()');
const _I_STATUS_SET = Symbol('._setStatus()');
const _I_IS_FINISHED = Symbol('._isFinished()');
const _I_REQ_HEADER_GET = Symbol('._getRequestHeader(key)');
const _I_REQ_HEADER_HAS = Symbol('._hasRequestHeader(key)');
const _I_REQ_HEADER_KEYS = Symbol('._getRequestHeaderKeys()');
const _I_REQ_HEADER_ENTRIES = Symbol('._getRequestHeaderEntries()');
const _I_REQ_BODY_DATA_GET = Symbol('._getRequestBodyData()');
const _I_RES_HEADER_GET = Symbol('._getResponseHeader(key)');
const _I_RES_HEADER_HAS = Symbol('._hasResponseHeader(key)');
const _I_RES_HEADER_KEYS = Symbol('._getResponseHeaderKeys()');
const _I_RES_HEADER_ENTRIES = Symbol('._getResponseHeaderEntries()');
const _I_RES_HEADER_SET = Symbol('._setResponseHeader(key, value)');
const _I_RES_HEADER_DELETE = Symbol('._deleteResponseHeader(key)');
const _I_RES_HEADER_CLEAR = Symbol('._clearResponseHeaders()');
const _I_RES_BODY_DATA_GET = Symbol('._getResponseBodyData()');
const _I_RES_BODY_DATA_SET = Symbol('._setResponseBodyData(data)');

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
    IS: _I_IS_FINISHED,
  },
  REQUEST: {
    HEADER: {
      GET: _I_REQ_HEADER_GET,
      HAS: _I_REQ_HEADER_HAS,
      KEYS: _I_REQ_HEADER_KEYS,
      ENTRIES: _I_REQ_HEADER_ENTRIES,
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
      HAS: _I_RES_HEADER_HAS,
      KEYS: _I_RES_HEADER_KEYS,
      ENTRIES: _I_RES_HEADER_ENTRIES,
      SET: _I_RES_HEADER_SET,
      DELETE: _I_RES_HEADER_DELETE,
      CLEAR: _I_RES_HEADER_CLEAR,
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
