import { ThrowTypeError } from '@produck/type-error';
import { I, _I } from './Symbol.mjs';
import { AdapterGuard } from './Utils.mjs';
import * as Assert from './Parser.mjs';

const GuardNotThrow = {
  headerGet: AdapterGuard({
    message: 'Response header read failed.',
    member: _I.RESPONSE.HEADER.GET,
  }),
  headerKeys: AdapterGuard({
    message: 'Response header keys iteration failed.',
    member: _I.RESPONSE.HEADER.KEYS,
  }),
  headerSet: AdapterGuard({
    message: 'Response header write failed.',
    member: _I.RESPONSE.HEADER.SET,
  }),
  headerDelete: AdapterGuard({
    message: 'Response header delete failed.',
    member: _I.RESPONSE.HEADER.DELETE,
  }),
  bodyDataGet: AdapterGuard({
    message: 'Response body data read failed.',
    member: _I.RESPONSE.BODY.DATA.GET,
  }),
  bodyDataSet: AdapterGuard({
    message: 'Response body data write failed.',
    member: _I.RESPONSE.BODY.DATA.SET,
  }),
  statusGet: AdapterGuard({
    message: 'Response status code read failed.',
    member: _I.STATUS.GET,
  }),
  statusSet: AdapterGuard({
    message: 'Response status code write failed.',
    member: _I.STATUS.SET,
  }),
  statusTextGet: AdapterGuard({
    message: 'Response status text read failed.',
    member: _I.RESPONSE.STATUS_TEXT.GET,
  }),
  statusTextSet: AdapterGuard({
    message: 'Response status text write failed.',
    member: _I.RESPONSE.STATUS_TEXT.SET,
  }),
  isFinished: AdapterGuard({
    message: 'Response finished check failed.',
    member: _I.RESPONSE.IS_FINISHED,
  }),
};

class KittyExchangeResponseHeader {
  constructor(exchange) {
    this[I.EXCHANGE] = exchange;
  }

  get(key) {
    return GuardNotThrow.headerGet(this[I.EXCHANGE], key);
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

  set(key, value) {
    GuardNotThrow.headerSet(this[I.EXCHANGE], key, value);
  }

  delete(key) {
    GuardNotThrow.headerDelete(this[I.EXCHANGE], key);
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
    return GuardNotThrow.bodyDataGet(this[I.EXCHANGE]);
  }

  set data(value) {
    GuardNotThrow.bodyDataSet(this[I.EXCHANGE], value);
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
    return GuardNotThrow.statusGet(this[I.EXCHANGE]);
  }

  get statusText() {
    return GuardNotThrow.statusTextGet(this[I.EXCHANGE]);
  }

  setStatus(code, text) {
    Assert.HTTPStatusCode(code);

    GuardNotThrow.statusSet(this[I.EXCHANGE], code);

    if (text !== undefined) {
      if (typeof text !== 'string') {
        ThrowTypeError('args[1] as text', 'string');
      }

      GuardNotThrow.statusTextSet(this[I.EXCHANGE], text);
    }
  }

  get isFinished() {
    return GuardNotThrow.isFinished(this[I.EXCHANGE]);
  }
}
