import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_KIT = Symbol('.#kit');
const I_WORKFLOW = Symbol('.#workflow');
const I_ATTACH_WORKFLOW = Symbol('.#attachWorkflow()');
const I_ATTACH_DEPLOYMENT_ATTACHER = Symbol('.#attachDeploymentAttacher()');
const I_ATTACH_EXCHANGE_ATTACHER = Symbol('.#attachExchangeAttacher()');
const I_ATTACH_PREFIX_HANDLER = Symbol('.#attachPrefixHandler()');

export const I = deepFreeze({
  KIT: I_KIT,
  WORKFLOW: I_WORKFLOW,
  ATTACH: {
    WORKFLOW: I_ATTACH_WORKFLOW,
    DEPLOYMENT_ATTACHER: I_ATTACH_DEPLOYMENT_ATTACHER,
    EXCHANGE_ATTACHER: I_ATTACH_EXCHANGE_ATTACHER,
    PREFIX_HANDLER: I_ATTACH_PREFIX_HANDLER,
  },
});

const $I_KIT = Symbol('.$kit');
const $I_WORKFLOW = Symbol('.$workflow');
const $I_INSTALL = Symbol('.$install()');

export const $I = deepFreeze({
  KIT: $I_KIT,
  WORKFLOW: $I_WORKFLOW,
  INSTALL: $I_INSTALL,
});

const _I_INSTALL = Symbol('._install()');

export const _I = deepFreeze({
  INSTALL: _I_INSTALL,
});

const _S_TAG = Symbol('._tag');

export const _S = deepFreeze({
  TAG: _S_TAG,
});
