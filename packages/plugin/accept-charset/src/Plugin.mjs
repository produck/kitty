import { Ow } from '@produck/argot';
import { Implement } from '@produck/kitty-workflow';
import { useCharset } from '@produck/kitty-plugin-charset';

export const Plugin = Implement.Plugin({
  tag: 'kitty.exchange.request.accept.charset',
  install: (PluginKit) => {
    try {
      useCharset(PluginKit);
    } catch {
      Ow.Error.Common('The charset selector is NOT installed on the workflow.');
    }
  },
});
