import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_HEADER = Symbol('.#header');

export const I = deepFreeze({
  HEADER: I_HEADER,
});

const _I_METHOD_GET = Symbol('._getMethod()');
const _I_URL_GET = Symbol('._getURL()');

export const _I = deepFreeze({
  METHOD: {
    GET: _I_METHOD_GET,
  },
  URL: {
    GET: _I_URL_GET,
  },
});

const _S_HEADER_CTOR = Symbol('._headerCtor');

export const _S = deepFreeze({
  HEADER_CTOR: _S_HEADER_CTOR,
});
