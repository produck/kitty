import * as Part from '../Part/index.mjs';
import * as Header from './Header/index.mjs';
import * as Body from './Body/index.mjs';
import { EXCHANGE } from './_Borrow.mjs';
import { ThrowAdapter, AdapterGuard } from '../Utils.mjs';

const GuardNotThrow = {
  method: AdapterGuard({
    message: 'Request method read failed.',
    member: EXCHANGE._I.REQUEST.METHOD.GET,
  }),
  mode: AdapterGuard({
    message: 'Request mode read failed.',
    member: EXCHANGE._I.REQUEST.MODE.GET,
  }),
  url: AdapterGuard({
    message: 'Request URL read failed.',
    member: EXCHANGE._I.REQUEST.URL.GET,
  }),
};

export default class KittyExchangeRequest extends Part.Concrete {
  constructor(exchange) {
    super(exchange);
    this.header = new Header.Concrete(exchange);
    this.body = new Body.Concrete(exchange);
    Object.freeze(this);
  }

  get method() {
    return GuardNotThrow.method(this.exchange);
  }

  get mode() {
    return GuardNotThrow.mode(this.exchange);
  }

  get url() {
    const raw = GuardNotThrow.url(this.exchange);

    try {
      return new URL(raw);
    } catch {
      const host = this.header.get('host');

      if (host === undefined) {
        ThrowAdapter('Host header is required to construct request URL.');
      }

      return new URL(raw, `${this.exchange.protocol}//${host}`);
    }
  }

  get isConsumed() {
    return this.body.isConsumed;
  }
}
