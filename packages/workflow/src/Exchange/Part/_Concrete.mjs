import { SYMBOL } from '@produck/argot';

import { EXCHANGE } from './_Borrow.mjs';
import { I, $I } from './_Symbol.mjs';

export default class ExchangePart extends EventTarget {
  [I.EXCHANGE] = null;

  constructor(exchange) {
    super();
    this[SYMBOL.CONSTRUCTOR] = new.target;
    this[I.EXCHANGE] = exchange;
  }

  get exchange() {
    return this[I.EXCHANGE];
  }

  get workflow() {
    return this[I.EXCHANGE].workflow;
  }

  get [$I.INTERNAL]() {
    return this[I.EXCHANGE][EXCHANGE.I.INTERNAL];
  }
}
