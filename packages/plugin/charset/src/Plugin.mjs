import { Implement, Use } from '@produck/kitty-workflow';

import * as Bridge from './Bridge.mjs';

export const Plugin = Implement.Plugin({
  tag: 'kitty-charset',
  install: (PluginKit) => {
    Bridge.installSelector(Use.Workflow(PluginKit));
  },
});
