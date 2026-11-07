import { Implement } from '@produck/kitty-workflow';
import { useTypeTable } from '@produck/kitty-plugin-mime-type';

export const Plugin = Implement.Plugin({
  tag: 'kitty.exchange.request.type',
  install: (PluginKit) => {
    useTypeTable(PluginKit);
  },
});
