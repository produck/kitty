import { SYMBOL } from '@produck/argot';

import { I } from './_Symbol.mjs';

export default class ExchangePart extends EventTarget {
  [I.EXCHANGE] = null;

  constructor(exchange = null) {
    super();
    this[SYMBOL.CONSTRUCTOR] = new.target;
    this[I.EXCHANGE] = exchange;
  }

  get exchange() {
    return this[I.EXCHANGE];
  }
}
