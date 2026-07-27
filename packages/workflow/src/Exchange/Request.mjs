import { I, _I } from './Symbol.mjs';
import { ThrowAdapter, AdapterGuard } from './Utils.mjs';
import { useConfig } from './Config.mjs';
import { createBodyStream } from './Body.mjs';
import * as Assert from './Parser.mjs';

const $BODY_CACHE = Symbol('body.cache');

const GuardNotThrow = {
  header: AdapterGuard({
    message: 'Header read failed.',
    member: _I.REQUEST.HEADER.GET,
  }),
  headerKeys: AdapterGuard({
    message: 'Header keys iteration failed.',
    member: _I.REQUEST.HEADER.KEYS,
  }),
  bodyData: AdapterGuard({
    message: 'Request body data read failed.',
    member: _I.REQUEST.BODY.DATA.GET,
  }),
  method: AdapterGuard({
    message: 'Request method read failed.',
    member: _I.REQUEST.METHOD.GET,
  }),
  mode: AdapterGuard({
    message: 'Request mode read failed.',
    member: _I.REQUEST.MODE.GET,
  }),
  url: AdapterGuard({
    message: 'Request URL read failed.',
    member: _I.REQUEST.URL.GET,
  }),
  isConsumed: AdapterGuard({
    message: 'Request consumed check failed.',
    member: _I.REQUEST.IS_CONSUMED,
  }),
};

class KittyExchangeRequestHeader {
  constructor(exchange) {
    this[I.EXCHANGE] = exchange;
  }

  get(key) {
    Assert.HeaderName(key);

    return GuardNotThrow.header(this[I.EXCHANGE], key);
  }

  has(key) {
    return this.get(key) !== undefined;
  }

  keys() {
    return GuardNotThrow.headerKeys(this[I.EXCHANGE]);
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
    if (this[$BODY_CACHE] !== undefined) {
      return this[$BODY_CACHE];
    }

    const exchange = this[I.EXCHANGE];
    const raw = GuardNotThrow.bodyData(exchange);
    const kit = exchange[I.KIT];
    const config = useConfig(kit);
    const method = exchange[_I.REQUEST.METHOD.GET]();

    const stream = createBodyStream(raw, {
      maxBodySize: config.maxBodySize,
      memoryLimit: config.maxRequestBodyBuffer,
      allowedMethods: config.allowedBodyMethods,
      method,
    });

    this[$BODY_CACHE] = stream;
    return stream;
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
    return GuardNotThrow.method(this[I.EXCHANGE]);
  }

  get mode() {
    return GuardNotThrow.mode(this[I.EXCHANGE]);
  }

  get url() {
    const raw = GuardNotThrow.url(this[I.EXCHANGE]);

    try {
      return new URL(raw);
    } catch {
      const host = this.header.get('host');

      if (host === undefined) {
        ThrowAdapter('Host header is required to construct request URL.');
      }

      return new URL(raw, `${this[I.EXCHANGE].protocol}//${host}`);
    }
  }

  get isConsumed() {
    return GuardNotThrow.isConsumed(this[I.EXCHANGE]);
  }
}
