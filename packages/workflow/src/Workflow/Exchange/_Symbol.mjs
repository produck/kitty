import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_KIT = Symbol('.#kit');
const I_DEPLOYMENT = Symbol('.#deployment');
const I_INTERNAL = Symbol('.#internal');
const I_REQUEST = Symbol('.#request');
const I_RESPONSE = Symbol('.#response');

export const I = deepFreeze({
  KIT: I_KIT,
  DEPLOYMENT: I_DEPLOYMENT,
  INTERNAL: I_INTERNAL,
  REQUEST: I_REQUEST,
  RESPONSE: I_RESPONSE,
});

const $I_INTERNAL = Symbol('.$internal');
const $I_KIT = Symbol('.$kit');

export const $I = deepFreeze({
  INTERNAL: $I_INTERNAL,
  KIT: $I_KIT,
});

const $S_IDENTITY = Symbol('.$identity()');

export const $S = deepFreeze({
  IDENTITY: $S_IDENTITY,
});

const _I_HTTP_VERSION = Symbol('._getHttpVersion()');
const _I_MODE_GET = Symbol('._getMode()');
const _I_SERVER_GET = Symbol('._getServer()');
const _I_SERVER_PROTOCOL_GET = Symbol('._getServerProtocol()');

export const _I = deepFreeze({
  HTTP_VERSION: _I_HTTP_VERSION,
  MODE: _I_MODE_GET,
  SERVER: {
    GET: _I_SERVER_GET,
    PROTOCOL: {
      GET: _I_SERVER_PROTOCOL_GET,
    },
  },
});

const _S_IDENTITY = Symbol('._identity()');
const _S_REQUEST_CTOR = Symbol('._requestCtor');
const _S_RESPONSE_CTOR = Symbol('._responseCtor');

export const _S = deepFreeze({
  IDENTITY: _S_IDENTITY,
  REQUEST_CTOR: _S_REQUEST_CTOR,
  RESPONSE_CTOR: _S_RESPONSE_CTOR,
});
