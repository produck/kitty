import * as Ow from '@produck/ow';
import { I, _I } from './Symbol.mjs';

class KittyExchangeRequestHeader {
  constructor(exchange) {
    this[I.EXCHANGE] = exchange;
  }

  get(key) {
    const value = this[I.EXCHANGE][_I.REQUEST.HEADER.GET](key);

    if (key === 'host' && value === undefined) {
      Ow.Error.Common('Missing required Host header.');
    }

    return value;
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
    return this[I.EXCHANGE][_I.REQUEST.METHOD.GET]();
  }

  get mode() {
    return this[I.EXCHANGE][_I.REQUEST.MODE.GET]();
  }

  get url() {
    const { [I.EXCHANGE]: exchange } = this;
    const raw = exchange[_I.REQUEST.URL.GET]();

    try {
      return new URL(raw);
    } catch {
      return new URL(raw, `${exchange.protocol}//${this.header.get('host')}`);
    }
  }

  get isConsumed() {
    return this[I.EXCHANGE][_I.REQUEST.IS_CONSUMED]();
  }
}
