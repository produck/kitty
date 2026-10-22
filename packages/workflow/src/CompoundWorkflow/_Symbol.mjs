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

const $I_STATE = Symbol('.$state');
const $I_NORMALIZE_HTTP_RESPONSE_BODY_DATA = Symbol(
  '.$normalizeHttpResponseBodyData()',
);

export const $I = deepFreeze({
  STATE: $I_STATE,
  NORMALIZE_HTTP_RESPONSE_BODY_DATA: $I_NORMALIZE_HTTP_RESPONSE_BODY_DATA,
});

const _I_NORMALIZE_HTTP_RESPONSE_BODY_DATA = Symbol(
  '._normalizeHttpResponseBodyData()',
);

export const _I = deepFreeze({
  NORMALIZE_HTTP_RESPONSE_BODY_DATA: _I_NORMALIZE_HTTP_RESPONSE_BODY_DATA,
});

export const A = deepFreeze({
  $I: {
    NORMALIZE_DATA: $I_NORMALIZE_HTTP_RESPONSE_BODY_DATA,
  },
});
