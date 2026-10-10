import * as Part from '../../Part/index.mjs';
import { EXCHANGE } from './_Borrow.mjs';
import { AdapterGuard } from '../../Utils.mjs';
import * as Assert from '../../Parser.mjs';

const GuardNotThrow = {
  header: AdapterGuard({
    message: 'Header read failed.',
    member: EXCHANGE._I.REQUEST.HEADER.GET,
  }),
  headerKeys: AdapterGuard({
    message: 'Header keys iteration failed.',
    member: EXCHANGE._I.REQUEST.HEADER.KEYS,
  }),
};

export default class KittyExchangeRequestHeader extends Part.Concrete {
  get(key) {
    Assert.HeaderName(key);

    return GuardNotThrow.header(this.exchange, key);
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
}
