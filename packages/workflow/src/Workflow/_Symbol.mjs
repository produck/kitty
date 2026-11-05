import { deepFreeze } from '@produck/deep-freeze-enumerable';

const S_HEADER_SPECIFICATION = Symbol('.#headerSpecification');

export const S = deepFreeze({
  HEADER_SPECIFICATION: S_HEADER_SPECIFICATION,
});

const I_KIT = Symbol('.#kit');
const I_HANDLER_LIST = Symbol('.#handlerList');

export const I = deepFreeze({
  KIT: I_KIT,
  HANDLER_LIST: I_HANDLER_LIST,
});

const $I_KIT = Symbol('.$kit');
const $I_PIPELINE = Symbol('.$pipeline');
const $I_HEADER_SPECIFICATION = Symbol('.$headerSpecification');
const $I_COMPILE = Symbol('.$compile()');
const $I_DEPLOY = Symbol('.$deploy()');
const $I_PREPEND = Symbol('.$prependCompose()');
const $I_ASSERT_FINALIZED = Symbol('.$assertFinalized()');
const $I_ASSERT_NOT_FINALIZED = Symbol('.$assertNotFinalized()');

export const $I = deepFreeze({
  KIT: $I_KIT,
  PIPELINE: $I_PIPELINE,
  HEADER_SPECIFICATION: $I_HEADER_SPECIFICATION,
  COMPILE: $I_COMPILE,
  DEPLOY: $I_DEPLOY,
  COMPOSE: {
    PREPEND: $I_PREPEND,
  },
  ASSERT: {
    FINALIZED: $I_ASSERT_FINALIZED,
    NOT_FINALIZED: $I_ASSERT_NOT_FINALIZED,
  },
});

const _I_EXTEND_COMPOSE = Symbol('._extendCompose()');
const _I_COMPILE_DEPLOYMENT = Symbol('._compileDeployment()');

export const _I = deepFreeze({
  COMPOSE: {
    EXTEND: _I_EXTEND_COMPOSE,
  },
  COMPILE_DEPLOYMENT: _I_COMPILE_DEPLOYMENT,
});
