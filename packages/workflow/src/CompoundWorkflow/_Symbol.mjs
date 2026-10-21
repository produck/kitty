import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_HANDLED_EXCHANGE_SET = Symbol('.#handledExchangeSet');
const I_HANDLE_EXCHANGE = Symbol('.#handleExchange()');
const I_PREFIX_HANDLER_LIST = Symbol('.#mixinHandlerPrefixList');
const I_DEPLOYMENT_ATTACHER_LIST = Symbol('.#mixinDeploymentAttacherList');
const I_EXCHANGE_ATTACHER_LIST = Symbol('.#mixinExchangeAttacherList');

export const I = deepFreeze({
  HANDLED_EXCHANGE_SET: I_HANDLED_EXCHANGE_SET,
  HANDLE_EXCHANGE: I_HANDLE_EXCHANGE,
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
