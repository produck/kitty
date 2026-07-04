import { I, _I } from './Symbol.mjs';

class KittyExchangeRequestHeader {
  constructor(exchange) {
    this[I.EXCHANGE_KIT] = exchange;
  }

  get(key) {
    return this[I.EXCHANGE_KIT][_I.REQUEST.HEADER.GET](key);
  }

  has(key) {
    return this.get(key) !== undefined;
  }

  keys() {
    return this[I.EXCHANGE_KIT][_I.REQUEST.HEADER.KEYS]();
  }

  *entries() {
    for (const key of this.keys()) {
      yield [key, this.get(key)];
    }
  }
}

class KittyExchangeRequestBody {
  constructor(exchange) {
    this[I.EXCHANGE_KIT] = exchange;
  }

  get data() {
    return this[I.EXCHANGE_KIT][_I.REQUEST.BODY.DATA.GET]();
  }
}

export default class KittyExchangeRequest {
  constructor(exchange) {
    this[I.EXCHANGE_KIT] = exchange;
    this.header = new KittyExchangeRequestHeader(exchange);
    this.body = new KittyExchangeRequestBody(exchange);
    Object.freeze(this);
  }

  get method() {
    return this[I.EXCHANGE_KIT].method;
  }

  get URL() {
    return this[I.EXCHANGE_KIT].URL;
  }
}
