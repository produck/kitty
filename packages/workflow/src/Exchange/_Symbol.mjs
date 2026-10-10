import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_REQUEST = Symbol('.#request');
const I_RESPONSE = Symbol('.#response');

export const I = deepFreeze({
  REQUEST: I_REQUEST,
  RESPONSE: I_RESPONSE,
});

const $I_KIT = Symbol('.$kit');

export const $I = deepFreeze({
  KIT: $I_KIT,
});

const _I_IDENTITY_GET = Symbol('._getIdentity()');
const _I_SERVER_GET = Symbol('._getServer()');
const _I_SERVER_PROTOCOL_GET = Symbol('._getServerProtocol()');
const _I_HTTP_VERSION_GET = Symbol('._getHttpVersion()');

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
});

const _S_REQUEST_CTOR = Symbol('._requestCtor');
const _S_RESPONSE_CTOR = Symbol('._responseCtor');

export const _S = deepFreeze({
  REQUEST_CTOR: _S_REQUEST_CTOR,
  RESPONSE_CTOR: _S_RESPONSE_CTOR,
});
