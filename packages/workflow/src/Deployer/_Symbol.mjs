import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_KIT = Symbol('.#kit');
const I_EXCHANGE_ATTACHER_LIST = Symbol('.#exchangeAttacherList');
const I_INSTALLED = Symbol('.#installed');
const I_ATTACH_LISTENER = Symbol('.#attachListener()');
const I_ATTACH_SERVER_LINKER = Symbol('.#attachServerLinker()');
const I_ATTACH_EXCHANGE_ATTACHER = Symbol('.#attachExchangeAttacher()');
const I_ASSERT_NOT_INSTALLED = Symbol('.#assertNotInstalled()');

const $I_INSTALL = Symbol('.$install()');
const $I_LISTENERS = Symbol('.$listeners');
const $I_LINK_LIST = Symbol('.$linkList');
const $I_ATTACH_EXCHANGE = Symbol('.$attachExchange()');

const _I_INSTALL = Symbol('._install()');

export const I = deepFreeze({
  KIT: I_KIT,
  EXCHANGE_ATTACHER_LIST: I_EXCHANGE_ATTACHER_LIST,
  INSTALLED: I_INSTALLED,
  ATTACH: {
    LISTENER: I_ATTACH_LISTENER,
    SERVER_LINKER: I_ATTACH_SERVER_LINKER,
    EXCHANGE_ATTACHER: I_ATTACH_EXCHANGE_ATTACHER,
  },
  ASSERT: {
    NOT_INSTALLED: I_ASSERT_NOT_INSTALLED,
  },
});

export const $I = deepFreeze({
  INSTALL: $I_INSTALL,
  LISTENERS: $I_LISTENERS,
  LINK_LIST: $I_LINK_LIST,
  ATTACH_EXCHANGE: $I_ATTACH_EXCHANGE,
});

export const _I = deepFreeze({
  INSTALL: _I_INSTALL,
});

const _S_NAME = Symbol('._name');
const _S_SERVER_CTOR = Symbol('._serverCtor');
const _S_HTTP_EXCHANGE_CTOR = Symbol('._httpExchangeCtor');
const _S_WEBSOCKET_EXCHANGE_CTOR = Symbol('._webSocketExchangeCtor');

export const _S = deepFreeze({
  NAME: _S_NAME,
  SERVER_CTOR: _S_SERVER_CTOR,
  EXCHANGE_CTOR: {
    HTTP: _S_HTTP_EXCHANGE_CTOR,
    WEBSOCKET: _S_WEBSOCKET_EXCHANGE_CTOR,
  },
});
