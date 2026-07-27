import * as Kit from '@produck/kit';

import * as Assert from './Parser.mjs';

const CAP_EXCHANGE_CONFIGURATION = Symbol('ExchangeConfigurationObject');

export const { use: useConfig } = Kit.Getter(CAP_EXCHANGE_CONFIGURATION);

function normalizeEntry(def) {
  return typeof def === 'object' && 'default' in def ? def : { default: def };
}

function defineConfiguration(schema) {
  const _value = Symbol('configuration.value');

  return class ExchangeConfiguration {
    [_value] = {};

    constructor() {
      for (const [key, def] of Object.entries(schema)) {
        const { default: _default, assert: _assert } = normalizeEntry(def);

        this[_value][key] = _default;

        Object.defineProperty(this, key, {
          get() {
            return this[_value][key];
          },
          set(v) {
            if (_assert) {
              _assert(v);
            }
            this[_value][key] = v;
          },
          enumerable: true,
          configurable: false,
        });
      }
    }
  };
}

export const Configuration = defineConfiguration({
  // ——— Exchange lifecycle —————————————————————

  timeout: {
    default: 2 * 60,
    assert: Assert.PositiveInteger,
  },

  // ——— Body ————————————————————————————

  maxBodySize: {
    default: 1 << 20,
    assert: Assert.PositiveInteger,
  },

  maxRequestBodyBuffer: {
    default: 4 << 10,
    assert: Assert.NonNegativeInteger,
  },

  allowedBodyMethods: {
    default: ['POST', 'PUT', 'PATCH'],
    assert: Assert.HttpMethodList,
  },
});

const mapWorkflowToConfiguration = new WeakMap();

export function install(WorkflowKit, workflow) {
  const config = new Configuration();

  WorkflowKit[CAP_EXCHANGE_CONFIGURATION] = config;
  mapWorkflowToConfiguration.set(workflow, config);
}

export function tuneTimeout(workflow, value) {
  const config = mapWorkflowToConfiguration.get(workflow);

  if (config === undefined) {
    throw new Error(
      'Exchange Configuration has not been installed on this workflow.',
    );
  }

  config.timeout = value;
}
