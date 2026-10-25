import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_KIT = Symbol('.#kit');
const I_DEPLOYMENT = Symbol('.#deployment');
const I_ATTACH_MANIFEST = Symbol('.#attachManifest()');
const I_ATTACH_SERVER_LINKER = Symbol('.#attachServerLinker()');
const I_ATTACH_EXCHANGE_ATTACHER = Symbol('.#attachExchangeAttacher()');
const I_ATTACH_DEPLOYMENT = Symbol('.#attachDeployment()');
const I_ATTACH_HANDLER_HTTP = Symbol('.#attachHttpHandler()');
const I_ATTACH_HANDLER_WEB_SOCKET = Symbol('.#attachWebSocketHandler()');
const I_ASSERT_NOT_COMMITTED = Symbol('.#assertNotCommitted()');

const $I_INSTALL = Symbol('.$install()');

const _I_INSTALL = Symbol('._install()');

export const I = deepFreeze({
  KIT: I_KIT,
  DEPLOYMENT: I_DEPLOYMENT,
  ATTACH: {
    MANIFEST: I_ATTACH_MANIFEST,
    SERVER_LINKER: I_ATTACH_SERVER_LINKER,
    EXCHANGE_ATTACHER: I_ATTACH_EXCHANGE_ATTACHER,
    DEPLOYMENT: I_ATTACH_DEPLOYMENT,
    HANDLER: {
      HTTP: I_ATTACH_HANDLER_HTTP,
      WEB_SOCKET: I_ATTACH_HANDLER_WEB_SOCKET,
    },
  },
  ASSERT: {
    NOT_COMMITTED: I_ASSERT_NOT_COMMITTED,
  },
});

export const $I = deepFreeze({
  INSTALL: $I_INSTALL,
});

export const _I = deepFreeze({
  INSTALL: _I_INSTALL,
});

const _S_TAG = Symbol('._tag');
const _S_SERVER_CTOR = Symbol('._serverCtor');
const _S_HTTP_EXCHANGE_CTOR = Symbol('._httpExchangeCtor');
const _S_WEB_SOCKET_EXCHANGE_CTOR = Symbol('._webSocketExchangeCtor');

export const _S = deepFreeze({
  TAG: _S_TAG,
  SERVER_CTOR: _S_SERVER_CTOR,
  EXCHANGE_CTOR: {
    HTTP: _S_HTTP_EXCHANGE_CTOR,
    WEB_SOCKET: _S_WEB_SOCKET_EXCHANGE_CTOR,
  },
});
