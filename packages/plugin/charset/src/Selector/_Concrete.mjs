import { Ow } from '@produck/argot';
import { Selector, SYMBOL } from '@produck/kitty-charset';

import * as Record from './Record.mjs';
import { I, $I } from './_Symbol.mjs';

export default class ConcreteSelector extends Selector {
  [I.RECORD_LIST] = [];

  *[SYMBOL.SELECTOR._I.EXTEND]() {
    for (const record of this[I.RECORD_LIST]) {
      yield Record.copy(record);
    }
  }

  [$I.REGISTER](record) {
    const registered = Record.normalize(record);
    const sameName = this[I.RECORD_LIST].find(({ name }) => {
      return name.toLowerCase() === registered.name.toLowerCase();
    });

    if (sameName !== undefined) {
      Ow.Error.Common(`The charset "${registered.name}" is registered.`);
    }

    this[I.RECORD_LIST].push(registered);

    return Record.copy(registered);
  }
}
