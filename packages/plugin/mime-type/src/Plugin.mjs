import { Implement, Use } from '@produck/kitty-workflow';

import * as Bridge from './Bridge.mjs';
import { $I } from './TypeTable/_Symbol.mjs';
import { ALIAS_LIST, CHARSET_LIST, MIME_TYPE, Web } from './Preset/Web.mjs';

function toItem(source) {
  return {
    mimeType: source[MIME_TYPE],
    aliasList: [...source[ALIAS_LIST]],
    charsetList: [...source[CHARSET_LIST]],
  };
}

export const Plugin = Implement.Plugin({
  tag: 'kitty-type-table',
  install: (PluginKit) => {
    const workflow = Use.Workflow(PluginKit);
    const typeTable = Bridge.installTypeTable(workflow);

    typeTable[$I.REGISTER_ITEMS](Web.map(toItem));
  },
});
