import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_CONSTRUCTOR = Symbol('#constructor');
const I_HANDLER_LIST = Symbol('#handlerList');
const I_DEPLOY = Symbol('#deploy()');
const I_COMPILE = Symbol('#compile()');
const I_ASSERT_FINALIZED = Symbol('#assertFinalized()');

export const I = deepFreeze({
  CONSTRUCTOR: I_CONSTRUCTOR,
  HANDLER_LIST: I_HANDLER_LIST,
  DEPLOY: I_DEPLOY,
  COMPILE: I_COMPILE,
  ASSERT: {
    FINALIZED: I_ASSERT_FINALIZED,
  },
});

const $I_KIT = Symbol('.$kit');
const $I_WORKFLOW = Symbol('$workflow');
const $I_HANDLE_EXCHANGE = Symbol('$handleExchange()');
const $I_COMPOSE_PREFIX = Symbol('$composePrefix()');
const $I_COMPOSE_SUFFIX = Symbol('$composeSuffix()');

export const $I = deepFreeze({
  KIT: $I_KIT,
  WORKFLOW: $I_WORKFLOW,
  HANDLE_EXCHANGE: $I_HANDLE_EXCHANGE,
  COMPOSE: {
    PREFIX: $I_COMPOSE_PREFIX,
    SUFFIX: $I_COMPOSE_SUFFIX,
  },
});

export const _I_EXTEND_COMPOSE = Symbol('_extendCompose');
export const _I_ADAPTER_COMPILE = Symbol('_compileByAdapter');
export const _I_ADAPTER_LINK = Symbol('_linkByAdapter');
export const _I_DEPLOY = Symbol('_deploy');

export const _I = deepFreeze({
  COMPOSE: {
    EXTEND: _I_EXTEND_COMPOSE,
  },
  ADAPTER: {
    COMPILE: _I_ADAPTER_COMPILE,
  },
  DEPLOY: _I_DEPLOY,
});
