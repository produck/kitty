import { I, _I } from './Symbol.mjs';

class KittyTransactionRequestHeader {
  constructor(transaction) {
    this[I.TRANSACTION] = transaction;
  }

  get(key) {
    return this[I.TRANSACTION][_I.REQUEST.HEADER.GET](key);
  }

  has(key) {
    return this[I.TRANSACTION][_I.REQUEST.HEADER.HAS](key);
  }

  keys() {
    return this[I.TRANSACTION][_I.REQUEST.HEADER.KEYS]();
  }

  entries() {
    return this[I.TRANSACTION][_I.REQUEST.HEADER.ENTRIES]();
  }
}

class KittyTransactionRequestBody {
  constructor(transaction) {
    this[I.TRANSACTION] = transaction;
  }

  get data() {
    return this[I.TRANSACTION][_I.REQUEST.BODY.DATA.GET]();
  }
}

export default class KittyTransactionRequest {
  constructor(transaction) {
    this[I.TRANSACTION] = transaction;
    this.header = new KittyTransactionRequestHeader(transaction);
    this.body = new KittyTransactionRequestBody(transaction);
    Object.freeze(this);
  }

  get method() {
    return this[I.TRANSACTION].method;
  }

  get URL() {
    return this[I.TRANSACTION].URL;
  }
}
