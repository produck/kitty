import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_HEADER = Symbol('.#header');
const I_BODY = Symbol('.#body');

export const I = deepFreeze({
  HEADER: I_HEADER,
  BODY: I_BODY,
});

const _I_MODE_GET = Symbol('._getMode()');
const _I_METHOD_GET = Symbol('._getMethod()');
const _I_URL_GET = Symbol('._getURL()');
const _I_IS_CONSUMED = Symbol('._isConsumed()');

export const _I = deepFreeze({
  MODE: {
    GET: _I_MODE_GET,
  },
  METHOD: {
    GET: _I_METHOD_GET,
  },
  URL: {
    GET: _I_URL_GET,
  },
  IS_CONSUMED: _I_IS_CONSUMED,
});

const _S_HEADER_CTOR = Symbol('._headerCtor');
const _S_BODY_CTOR = Symbol('._bodyCtor');

export const _S = deepFreeze({
  HEADER_CTOR: _S_HEADER_CTOR,
  BODY_CTOR: _S_BODY_CTOR,
});
