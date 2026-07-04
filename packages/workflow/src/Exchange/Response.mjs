import { ThrowTypeError } from '@produck/type-error';
import { I, _I } from './Symbol.mjs';
import * as Assert from './Parser.mjs';

class KittyExchangeResponseHeader {
  constructor(exchange) {
    this[I.EXCHANGE] = exchange;
  }

  get(key) {
    return this[I.EXCHANGE][_I.RESPONSE.HEADER.GET](key);
  }

  has(key) {
    return this.get(key) !== undefined;
  }

  keys() {
    return this[I.EXCHANGE][_I.RESPONSE.HEADER.KEYS]();
  }

  *entries() {
    for (const key of this.keys()) {
      yield [key, this.get(key)];
    }
  }

  set(key, value) {
    this[I.EXCHANGE][_I.RESPONSE.HEADER.SET](key, value);
  }

  delete(key) {
    this[I.EXCHANGE][_I.RESPONSE.HEADER.DELETE](key);
  }

  clear() {
    for (const key of this.keys()) {
      this.delete(key);
    }
  }
}

class KittyExchangeResponseBody {
  constructor(exchange) {
    this[I.EXCHANGE] = exchange;
  }

  get data() {
    return this[I.EXCHANGE][_I.RESPONSE.BODY.DATA.GET]();
  }

  set data(value) {
    this[I.EXCHANGE][_I.RESPONSE.BODY.DATA.SET](value);
  }
}

export default class KittyExchangeResponse {
  constructor(exchange) {
    this[I.EXCHANGE] = exchange;
    this.header = new KittyExchangeResponseHeader(exchange);
    this.body = new KittyExchangeResponseBody(exchange);
    Object.freeze(this);
  }

  get statusCode() {
    return this[I.EXCHANGE][_I.STATUS.GET]();
  }

  get statusText() {
    return this[I.EXCHANGE][_I.RESPONSE.STATUS_TEXT.GET]();
  }

  setStatus(code, text) {
    Assert.HTTPStatusCode(code);

    this[I.EXCHANGE][_I.STATUS.SET](code);

    if (text !== undefined) {
      if (typeof text !== 'string') {
        ThrowTypeError('args[1] as text', 'string');
      }

      this[I.EXCHANGE][_I.RESPONSE.STATUS_TEXT.SET](text);
    }
  }
}
