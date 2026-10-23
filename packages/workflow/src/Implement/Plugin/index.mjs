import { SubConstructorProxy as SCP } from '@produck/es-abstract';

import { Abstract as PluginAbstract } from '../../CompoundWorkflow/Plugin/index.mjs';
import * as PLUGIN from '../../CompoundWorkflow/Plugin/_Symbol.mjs';
import Normalize from './Normalize.mjs';

export function Plugin(_options) {
  const { name, install } = Normalize(_options);

  class ImplPlugin extends PluginAbstract {
    static get name() {
      return name;
    }

    static get [PLUGIN._S.NAME]() {
      return name;
    }

    [PLUGIN._I.INSTALL](kit) {
      install(kit);
    }
  }

  return SCP(ImplPlugin);
}
