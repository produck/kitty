import { Implement, Use } from '@produck/kitty-workflow';

import * as Bridge from './Bridge.mjs';
import * as Preset from './Preset.mjs';
import { $I } from './TypeTable/_Symbol.mjs';

function toItem(source) {
  return {
    mimeType: source[Preset.MIME_TYPE],
    aliasList: [...source[Preset.ALIAS_LIST]],
    charsetList: [...source[Preset.CHARSET_LIST]],
  };
}

export const Plugin = Implement.Plugin({
  tag: 'kitty-type-table',
  install: (PluginKit) => {
    const workflow = Use.Workflow(PluginKit);
    const typeTable = Bridge.installTypeTable(workflow);

    typeTable[$I.REGISTER_ITEMS](Preset.Web.map(toItem));
  },
});
