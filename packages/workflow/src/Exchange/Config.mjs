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

  // maxBodySize: {
  //   default: 1 << 20,
  //   assert: Assert.PositiveInteger,
  // },
});

export function attachToWorkflowKit(WorkflowKit) {
  WorkflowKit[CAP_EXCHANGE_CONFIGURATION] = new Configuration();
}
