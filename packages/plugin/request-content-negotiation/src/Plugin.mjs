import { Ow } from '@produck/argot';
import { Implement } from '@produck/kitty-workflow';
import { useTypeTable } from '@produck/kitty-plugin-mime-type';

export const Plugin = Implement.Plugin({
  tag: 'kitty.exchange.request.content.negotiation',
  install: (PluginKit) => {
    try {
      useTypeTable(PluginKit);
    } catch {
      Ow.Error.Common('The mime type table is NOT installed on the workflow.');
    }
  },
});
