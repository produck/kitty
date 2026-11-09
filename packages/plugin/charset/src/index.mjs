import { Abstract } from '@produck/kitty-workflow';
import { deepFreeze } from '@produck/deep-freeze-enumerable';
import { instanceOf, ThrowTypeError } from '@produck/argot';

import * as Bridge from './Bridge.mjs';
import * as Selector from './Selector/index.mjs';
import { $I } from './Selector/_Symbol.mjs';

export { useCharset } from './Capability.mjs';
export { Plugin } from './Plugin.mjs';

function Operation(perform) {
  return (workflow, ...argList) => {
    if (!instanceOf(workflow, Abstract.Workflow)) {
      ThrowTypeError('args[0] as workflow', 'a workflow');
    }

    return perform(Bridge.getSelector(workflow), ...argList);
  };
}

export const Record = deepFreeze({
  register: Operation((selector, record) => {
    return selector[$I.REGISTER](Selector.Record.normalize(record));
  }),
});
