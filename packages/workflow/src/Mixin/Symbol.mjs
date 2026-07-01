import { deepFreeze } from '@produck/deep-freeze-enumerable';

const NS = (name) => `KittyWorkflow.${name}`;
const I_PREFIX_HANDLER_LIST = Symbol(NS('$handlerPrefixSequence'));
const I_DEPLOYMENT_ATTACHER_LIST = Symbol(NS('$deploymentAttacherList'));
const I_EXCHANGE_ATTACHER_LIST = Symbol(NS('$exchangeAttacherList'));

export default deepFreeze({
  WORKFLOW: {
    I: {
      HANDLER: {
        PREFIX: {
          LIST: I_PREFIX_HANDLER_LIST,
        },
      },
      DEPLOYMENT: {
        ATTACHER: {
          LIST: I_DEPLOYMENT_ATTACHER_LIST,
        },
      },
      EXCHANGE: {
        ATTACHER: {
          LIST: I_EXCHANGE_ATTACHER_LIST,
        },
      },
    },
  },
});
