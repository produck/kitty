import { I, _I } from './Symbol.mjs';

class KittyTransactionResponseHeader {
  constructor(transaction) {
    this[I.TRANSACTION] = transaction;
  }

  get(key) {
    return this[I.TRANSACTION][_I.RESPONSE.HEADER.GET](key);
  }

  has(key) {
    return this[I.TRANSACTION][_I.RESPONSE.HEADER.HAS](key);
  }

  keys() {
    return this[I.TRANSACTION][_I.RESPONSE.HEADER.KEYS]();
  }

  entries() {
    return this[I.TRANSACTION][_I.RESPONSE.HEADER.ENTRIES]();
  }

  set(key, value) {
    this[I.TRANSACTION][_I.RESPONSE.HEADER.SET](key, value);
  }

  delete(key) {
    this[I.TRANSACTION][_I.RESPONSE.HEADER.DELETE](key);
  }

  clear() {
    this[I.TRANSACTION][_I.RESPONSE.HEADER.CLEAR]();
  }
}

class KittyTransactionResponseBody {
  constructor(transaction) {
    this[I.TRANSACTION] = transaction;
  }

  get data() {
    return this[I.TRANSACTION][_I.RESPONSE.BODY.DATA.GET]();
  }

  set data(value) {
    this[I.TRANSACTION][_I.RESPONSE.BODY.DATA.SET](value);
  }
}

export default class KittyTransactionResponse {
  constructor(transaction) {
    this[I.TRANSACTION] = transaction;
    this.header = new KittyTransactionResponseHeader(transaction);
    this.body = new KittyTransactionResponseBody(transaction);
    Object.freeze(this);
  }

  get status() {
    return this[I.TRANSACTION].status;
  }

  set status(value) {
    this[I.TRANSACTION].status = value;
  }
}
