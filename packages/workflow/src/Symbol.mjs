import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_CONSTRUCTOR = Symbol('.#constructor');
const I_HANDLER_LIST = Symbol('.#handlerList');

export const I = deepFreeze({
  CONSTRUCTOR: I_CONSTRUCTOR,
  HANDLER_LIST: I_HANDLER_LIST,
});

const $I_KIT = Symbol('.$kit');
const $I_WORKFLOW = Symbol('.$workflow');
const $I_DEPLOY = Symbol('.$deploy()');
const $I_COMPILE = Symbol('.$compile()');
const $I_PREPEND = Symbol('.$prependCompose()');
const $I_ASSERT_FINALIZED = Symbol('.$assertFinalized()');
const $I_ASSERT_NOT_FINALIZED = Symbol('.$assertNotFinalized()');

export const $I = deepFreeze({
  KIT: $I_KIT,
  WORKFLOW: $I_WORKFLOW,
  DEPLOY: $I_DEPLOY,
  COMPILE: $I_COMPILE,
  COMPOSE: {
    PREPEND: $I_PREPEND,
  },
  ASSERT: {
    FINALIZED: $I_ASSERT_FINALIZED,
    NOT_FINALIZED: $I_ASSERT_NOT_FINALIZED,
  },
});

const _I_EXTEND_COMPOSE = Symbol('._extendCompose');
const _I_COMPILE_ARTIFACT = Symbol('._compileArtifact');

export const _I = deepFreeze({
  COMPOSE: {
    EXTEND: _I_EXTEND_COMPOSE,
  },
  COMPILE_ARTIFACT: _I_COMPILE_ARTIFACT,
});
