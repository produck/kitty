import { Implement, useWorkflow } from '@produck/kitty-workflow';

import { installConfiguration } from './Configuration.mjs';

export const Plugin = Implement.Plugin({
  tag: 'cookie',
  install(PluginKit) {
    installConfiguration(useWorkflow(PluginKit));
  },
});
