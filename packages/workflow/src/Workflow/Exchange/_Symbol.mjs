import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_KIT = Symbol('.#kit');
const I_INTERNAL = Symbol('.#internal');
const I_REQUEST = Symbol('.#request');
const I_RESPONSE = Symbol('.#response');

export const I = deepFreeze({
  KIT: I_KIT,
  INTERNAL: I_INTERNAL,
  REQUEST: I_REQUEST,
  RESPONSE: I_RESPONSE,
});

const $I_INTERNAL = Symbol('.$internal');
const $I_IDENTITY = Symbol('.$identity');
const $I_KIT = Symbol('.$kit');

export const $I = deepFreeze({
  INTERNAL: $I_INTERNAL,
  IDENTITY: $I_IDENTITY,
  KIT: $I_KIT,
});

const _I_HTTP_VERSION = Symbol('._getHttpVersion()');
const _I_IDENTITY_GET = Symbol('._getIdentity()');
const _I_MODE_GET = Symbol('._getMode()');
const _I_SERVER_GET = Symbol('._getServer()');
const _I_SERVER_PROTOCOL_GET = Symbol('._getServerProtocol()');

export const _I = deepFreeze({
  HTTP_VERSION: _I_HTTP_VERSION,
  IDENTITY: {
    GET: _I_IDENTITY_GET,
  },
  MODE: _I_MODE_GET,
  SERVER: {
    GET: _I_SERVER_GET,
    PROTOCOL: {
      GET: _I_SERVER_PROTOCOL_GET,
    },
  },
});

const _S_REQUEST_CTOR = Symbol('._requestCtor');
const _S_RESPONSE_CTOR = Symbol('._responseCtor');

export const _S = deepFreeze({
  REQUEST_CTOR: _S_REQUEST_CTOR,
  RESPONSE_CTOR: _S_RESPONSE_CTOR,
});
