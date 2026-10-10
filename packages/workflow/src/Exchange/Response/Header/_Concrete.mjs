import * as Part from '../../Part/index.mjs';
import { EXCHANGE } from './_Borrow.mjs';
import { AdapterGuard } from '../../Utils.mjs';
import * as Assert from '../../Parser.mjs';

const GuardNotThrow = {
  headerGet: AdapterGuard({
    message: 'Response header read failed.',
    member: EXCHANGE._I.RESPONSE.HEADER.GET,
  }),
  headerKeys: AdapterGuard({
    message: 'Response header keys iteration failed.',
    member: EXCHANGE._I.RESPONSE.HEADER.KEYS,
  }),
  headerSet: AdapterGuard({
    message: 'Response header write failed.',
    member: EXCHANGE._I.RESPONSE.HEADER.SET,
  }),
  headerDelete: AdapterGuard({
    message: 'Response header delete failed.',
    member: EXCHANGE._I.RESPONSE.HEADER.DELETE,
  }),
};

export default class KittyExchangeResponseHeader extends Part.Concrete {
  get(key) {
    Assert.HeaderName(key);

    return GuardNotThrow.headerGet(this.exchange, key);
  }

  has(key) {
    return this.get(key) !== undefined;
  }

  keys() {
    return GuardNotThrow.headerKeys(this.exchange);
  }

  *entries() {
    for (const key of this.keys()) {
      yield [key, this.get(key)];
    }
  }

  set(key, value) {
    Assert.HeaderName(key);
    Assert.HeaderValue(value);
    GuardNotThrow.headerSet(this.exchange, key, value);
  }

  delete(key) {
    Assert.HeaderName(key);
    GuardNotThrow.headerDelete(this.exchange, key);
  }

  clear() {
    for (const key of this.keys()) {
      this.delete(key);
    }
  }
}
