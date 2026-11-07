import { Implement, Use } from '@produck/kitty-workflow';

import * as Bridge from './Bridge.mjs';
import * as TypeTable from './TypeTable/index.mjs';
import { $I } from './TypeTable/_Symbol.mjs';
import Standard from './Preset/Standard.mjs';

export const Plugin = Implement.Plugin({
  tag: 'kitty-type-table',
  install: (PluginKit) => {
    const workflow = Use.Workflow(PluginKit);
    const typeTable = Bridge.installTypeTable(workflow);

    typeTable[$I.REGISTER_ITEMS](Standard.map(TypeTable.Item.normalize));
  },
});
