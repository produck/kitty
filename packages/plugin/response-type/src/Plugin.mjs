import { Ow } from '@produck/argot';
import { Implement } from '@produck/kitty-workflow';
import { useTypeTable } from '@produck/kitty-plugin-mime-type';
import { useCharset } from '@produck/kitty-plugin-charset';

export const Plugin = Implement.Plugin({
  tag: 'kitty.exchange.response.type',
  install: (PluginKit) => {
    try {
      useTypeTable(PluginKit);
    } catch {
      Ow.Error.Common('The mime type table is NOT installed on the workflow.');
    }

    try {
      useCharset(PluginKit);
    } catch {
      Ow.Error.Common('The charset selector is NOT installed on the workflow.');
    }
  },
});
