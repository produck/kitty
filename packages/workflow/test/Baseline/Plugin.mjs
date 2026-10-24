import { SubConstructorProxy as SCP } from '@produck/es-abstract';

import { Abstract, SYMBOL } from '@produck/kitty-workflow';

export function createPlugin(options = {}) {
  const { name = 'baseline', install = () => {} } = options;

  return SCP(
    class extends Abstract.Plugin {
      static get name() {
        return name;
      }

      static get [SYMBOL.PLUGIN._S.NAME]() {
        return name;
      }

      [SYMBOL.PLUGIN._I.INSTALL](kit) {
        install(kit);
      }
    },
  );
}
