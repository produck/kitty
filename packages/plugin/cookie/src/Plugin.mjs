import { Implement, Use } from '@produck/kitty-workflow';

import { installConfiguration } from './Configuration.mjs';

export const Plugin = Implement.Plugin({
  tag: 'kitty-cookie',
  install: (PluginKit) => {
    installConfiguration(Use.Workflow(PluginKit));
  },
});
