import { SubConstructorProxy as SCP } from '@produck/es-abstract';

import { Abstract as PluginAbstract } from '../../CompoundWorkflow/Plugin/index.mjs';
import * as PLUGIN from '../../CompoundWorkflow/Plugin/_Symbol.mjs';
import Normalize from './Normalize.mjs';

export function Plugin(_options) {
  const { tag, install } = Normalize(_options);

  class ImplPlugin extends PluginAbstract {
    static get [PLUGIN._S.TAG]() {
      return tag;
    }

    [PLUGIN._I.INSTALL](kit) {
      install(kit);
    }
  }

  return SCP(ImplPlugin);
}
