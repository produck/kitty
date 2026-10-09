import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_PREFIX_HANDLER_LIST = Symbol('.#mixinHandlerPrefixList');
const I_DEPLOYMENT_ATTACHER_LIST = Symbol('.#mixinDeploymentAttacherList');
const I_EXCHANGE_ATTACHER_LIST = Symbol('.#mixinExchangeAttacherList');

export const I = deepFreeze({
  MIXIN: {
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
});
