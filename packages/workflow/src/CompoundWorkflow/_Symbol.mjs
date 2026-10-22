import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_PLUGIN_HANDLER_PREFIX_LIST = Symbol('.#pluginHandlerPrefixList');
const I_PLUGIN_DEPLOYMENT_ATTACHER_LIST = Symbol(
  '.#pluginDeploymentAttacherList',
);
const I_PLUGIN_EXCHANGE_ATTACHER_LIST = Symbol('.#pluginExchangeAttacherList');

export const I = deepFreeze({
  PLUGIN_HANDLER_PREFIX_LIST: I_PLUGIN_HANDLER_PREFIX_LIST,
  PLUGIN_DEPLOYMENT_ATTACHER_LIST: I_PLUGIN_DEPLOYMENT_ATTACHER_LIST,
  PLUGIN_EXCHANGE_ATTACHER_LIST: I_PLUGIN_EXCHANGE_ATTACHER_LIST,
});

const $I_STATE = Symbol('.$state');
const $I_NORMALIZE_HTTP_RESPONSE_BODY_DATA = Symbol(
  '.$normalizeHttpResponseBodyData()',
);
const $I_APPEND_PREFIX_HANDLER = Symbol('.$appendPrefixHandler()');
const $I_APPEND_DEPLOYMENT_ATTACHER = Symbol('.$appendDeploymentAttacher()');
const $I_APPEND_EXCHANGE_ATTACHER = Symbol('.$appendExchangeAttacher()');

export const $I = deepFreeze({
  STATE: $I_STATE,
  NORMALIZE_HTTP_RESPONSE_BODY_DATA: $I_NORMALIZE_HTTP_RESPONSE_BODY_DATA,
  APPEND: {
    PREFIX_HANDLER: $I_APPEND_PREFIX_HANDLER,
    DEPLOYMENT_ATTACHER: $I_APPEND_DEPLOYMENT_ATTACHER,
    EXCHANGE_ATTACHER: $I_APPEND_EXCHANGE_ATTACHER,
  },
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
