import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_KIT = Symbol('.#kit');
const I_DEPLOYMENT = Symbol('.#deployment');
const I_INTERNAL = Symbol('.#internal');
const I_REQUEST = Symbol('.#request');

export const I = deepFreeze({
  KIT: I_KIT,
  DEPLOYMENT: I_DEPLOYMENT,
  INTERNAL: I_INTERNAL,
  REQUEST: I_REQUEST,
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
const _I_LOCAL_GET = Symbol('._getLocal()');
const _I_MODE_GET = Symbol('._getMode()');
const _I_REMOTE_GET = Symbol('._getRemote()');
const _I_SERVER_GET = Symbol('._getServer()');
const _I_SERVER_PROTOCOL_GET = Symbol('._getServerProtocol()');

export const _I = deepFreeze({
  HTTP_VERSION: _I_HTTP_VERSION,
  LOCAL: _I_LOCAL_GET,
  MODE: _I_MODE_GET,
  REMOTE: _I_REMOTE_GET,
  SERVER: {
    GET: _I_SERVER_GET,
    PROTOCOL: {
      GET: _I_SERVER_PROTOCOL_GET,
    },
  },
});

const _S_IDENTITY = Symbol('._identity()');
const _S_REQUEST_CTOR = Symbol('._requestCtor');

export const _S = deepFreeze({
  IDENTITY: _S_IDENTITY,
  REQUEST_CTOR: _S_REQUEST_CTOR,
});
