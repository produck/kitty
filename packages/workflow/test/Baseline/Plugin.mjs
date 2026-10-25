import { SubConstructorProxy as SCP } from '@produck/es-abstract';

import { Abstract, SYMBOL } from '@produck/kitty-workflow';

export function createPlugin(options = {}) {
  const { tag = 'baseline', install = () => {} } = options;

  return SCP(
    class extends Abstract.Plugin {
      static get [SYMBOL.PLUGIN._S.TAG]() {
        return tag;
      }

      [SYMBOL.PLUGIN._I.INSTALL](kit) {
        install(kit);
      }
    },
  );
}
