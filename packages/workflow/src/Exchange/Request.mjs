import { I, _I } from './Symbol.mjs';
import { ThrowAdapter, AssertAdapterNotThrow } from './Utils.mjs';

class KittyExchangeRequestHeader {
  constructor(exchange) {
    this[I.EXCHANGE] = exchange;
  }

  get(key) {
    const fn = () => this[I.EXCHANGE][_I.REQUEST.HEADER.GET](key);

    return AssertAdapterNotThrow('Header read failed.', fn);
  }

  has(key) {
    return this.get(key) !== undefined;
  }

  keys() {
    const fn = () => this[I.EXCHANGE][_I.REQUEST.HEADER.KEYS]();

    return AssertAdapterNotThrow('Header keys iteration failed.', fn);
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
    const fn = () => this[I.EXCHANGE][_I.REQUEST.BODY.DATA.GET]();

    return AssertAdapterNotThrow('Request body data read failed.', fn);
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
      const host = this.header.get('host');

      if (host === undefined) {
        ThrowAdapter('Host header is required to construct request URL.');
      }

      return new URL(raw, `${exchange.protocol}//${host}`);
    }
  }

  get isConsumed() {
    return this[I.EXCHANGE][_I.REQUEST.IS_CONSUMED]();
  }
}
