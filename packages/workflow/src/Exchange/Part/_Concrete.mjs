import { I } from './_Symbol.mjs';

export default class ExchangePart {
  constructor(exchange) {
    this[I.EXCHANGE] = exchange;
  }

  get exchange() {
    return this[I.EXCHANGE];
  }
}
