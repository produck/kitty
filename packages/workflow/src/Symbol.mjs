import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_CONSTRUCTOR = Symbol('.#constructor');
const I_HANDLER_LIST = Symbol('.#handlerList');
const I_DEPLOY = Symbol('.#deploy()');
const I_COMPILE = Symbol('.#compile()');

export const I = deepFreeze({
  CONSTRUCTOR: I_CONSTRUCTOR,
  HANDLER_LIST: I_HANDLER_LIST,
  DEPLOY: I_DEPLOY,
  COMPILE: I_COMPILE,
});

const $I_KIT = Symbol('.$kit');
const $I_WORKFLOW = Symbol('.$workflow');
const $I_HANDLE_EXCHANGE = Symbol('.$handleExchange()');
const $I_DEPLOYMENT_ATTACHER_LIST = Symbol('.$deploymentAttacherList');
const $I_EXCHANGE_ATTACHER_LIST = Symbol('.$exchangeAttacherList');
const $I_COMPOSE_PREFIX = Symbol('.$composePrefix()');
const $I_ASSERT_FINALIZED = Symbol('.$assertFinalized()');
const $I_ASSERT_NOT_FINALIZED = Symbol('.$assertNotFinalized()');

export const $I = deepFreeze({
  KIT: $I_KIT,
  WORKFLOW: $I_WORKFLOW,
  HANDLE_EXCHANGE: $I_HANDLE_EXCHANGE,
  DEPLOYMENT_ATTACHER_LIST: $I_DEPLOYMENT_ATTACHER_LIST,
  EXCHANGE_ATTACHER_LIST: $I_EXCHANGE_ATTACHER_LIST,
  COMPOSE: {
    PREFIX: $I_COMPOSE_PREFIX,
  },
  ASSERT: {
    FINALIZED: $I_ASSERT_FINALIZED,
    NOT_FINALIZED: $I_ASSERT_NOT_FINALIZED,
  },
});

export const _I_EXTEND_COMPOSE = Symbol('._extendCompose');
export const _I_ADAPTER_COMPILE = Symbol('._compileByAdapter');
export const _I_ADAPTER_LINK = Symbol('._linkByAdapter');

export const _I = deepFreeze({
  COMPOSE: {
    EXTEND: _I_EXTEND_COMPOSE,
  },
  ADAPTER: {
    COMPILE: _I_ADAPTER_COMPILE,
  },
});
