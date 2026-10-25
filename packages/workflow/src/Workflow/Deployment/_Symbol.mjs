import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_KIT = Symbol('.#kit');
const I_COMMITTED = Symbol('.#committed');
const I_LINKED = Symbol('.#linked');
const I_WORKFLOW = Symbol('.#workflow');
const I_SERVER = Symbol('.#server');
const I_MANIFEST = Symbol('.#manifest');
const I_LINK_LIST = Symbol('.#linkList');
const I_HANDLED_EXCHANGE_SET = Symbol('.#handledExchangeSet');
const I_EXCHANGE_ATTACHER_LIST = Symbol('.#exchangeAttacherList');

export const I = deepFreeze({
  KIT: I_KIT,
  COMMITTED: I_COMMITTED,
  LINKED: I_LINKED,
  WORKFLOW: I_WORKFLOW,
  SERVER: I_SERVER,
  MANIFEST: I_MANIFEST,
  LINK_LIST: I_LINK_LIST,
  HANDLED_EXCHANGE_SET: I_HANDLED_EXCHANGE_SET,
  EXCHANGE_ATTACHER_LIST: I_EXCHANGE_ATTACHER_LIST,
});

const $I_KIT = Symbol('.$kit');
const $I_WORKFLOW = Symbol('.$workflow');
const $I_SERVER = Symbol('.$server');
const $I_COMMITTED = Symbol('.$committed');
const $I_COMMIT = Symbol('.$commit()');
const $I_DECLARE = Symbol('.$declare()');
const $I_SET_LINKER = Symbol('.$setLinker()');
const $I_HANDLE_EXCHANGE = Symbol('.$handleExchange()');
const $I_REGISTER_EXCHANGE = Symbol('.$registerExchange()');
const $I_HAS_EXCHANGE = Symbol('.$hasExchange()');
const $I_ADD_EXCHANGE_ATTACHER = Symbol('.$addExchangeAttacher()');
const $I_ATTACH_EXCHANGE = Symbol('.$attachExchange()');

export const $I = deepFreeze({
  KIT: $I_KIT,
  WORKFLOW: $I_WORKFLOW,
  SERVER: $I_SERVER,
  COMMITTED: $I_COMMITTED,
  COMMIT: $I_COMMIT,
  DECLARE: $I_DECLARE,
  SET_LINKER: $I_SET_LINKER,
  HANDLE_EXCHANGE: $I_HANDLE_EXCHANGE,
  REGISTER_EXCHANGE: $I_REGISTER_EXCHANGE,
  HAS_EXCHANGE: $I_HAS_EXCHANGE,
  ADD_EXCHANGE_ATTACHER: $I_ADD_EXCHANGE_ATTACHER,
  ATTACH_EXCHANGE: $I_ATTACH_EXCHANGE,
});
