import { I, _I } from './Symbol.mjs';

class KittyExchangeRequestHeader {
  constructor(exchange) {
    this[I.EXCHANGE] = exchange;
  }

  get(key) {
    return this[I.EXCHANGE][_I.REQUEST.HEADER.GET](key);
  }

  has(key) {
    return this.get(key) !== undefined;
  }

  keys() {
    return this[I.EXCHANGE][_I.REQUEST.HEADER.KEYS]();
  }

  *entries() {
    for (const key of this.keys()) {
      yield [key, this.get(key)];
    }
  }
}

class KittyExchangeRequestBody {
  constructor(exchange) {
    this[I.EXCHANGE] = exchange;
  }

  get data() {
    return this[I.EXCHANGE][_I.REQUEST.BODY.DATA.GET]();
  }
}

export default class KittyExchangeRequest {
  constructor(exchange) {
    this[I.EXCHANGE] = exchange;
    this.header = new KittyExchangeRequestHeader(exchange);
    this.body = new KittyExchangeRequestBody(exchange);
    Object.freeze(this);
  }

  get method() {
    return this[I.EXCHANGE][_I.METHOD.GET]();
  }

  get mode() {
    return this[I.EXCHANGE][_I.MODE.GET]();
  }

  get url() {
    return this[I.EXCHANGE][_I.URL.GET]();
  }
}
