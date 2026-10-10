import * as Part from '../Part/index.mjs';
import * as Header from './Header/index.mjs';
import * as Body from './Body/index.mjs';
import { EXCHANGE } from './_Borrow.mjs';
import { AdapterGuard } from '../Utils.mjs';
import * as Assert from '../Parser.mjs';

const GuardNotThrow = {
  statusGet: AdapterGuard({
    message: 'Response status code read failed.',
    member: EXCHANGE._I.STATUS.GET,
  }),
  statusSet: AdapterGuard({
    message: 'Response status code write failed.',
    member: EXCHANGE._I.STATUS.SET,
  }),
  statusTextGet: AdapterGuard({
    message: 'Response status text read failed.',
    member: EXCHANGE._I.RESPONSE.STATUS_TEXT.GET,
  }),
  statusTextSet: AdapterGuard({
    message: 'Response status text write failed.',
    member: EXCHANGE._I.RESPONSE.STATUS_TEXT.SET,
  }),
  isFinished: AdapterGuard({
    message: 'Response finished check failed.',
    member: EXCHANGE._I.RESPONSE.IS_FINISHED,
  }),
};

export default class KittyExchangeResponse extends Part.Concrete {
  constructor(exchange) {
    super(exchange);
    this.header = new Header.Concrete(exchange);
    this.body = new Body.Concrete(exchange);
    Object.freeze(this);
  }

  get statusCode() {
    return GuardNotThrow.statusGet(this.exchange);
  }

  get statusText() {
    return GuardNotThrow.statusTextGet(this.exchange);
  }

  setStatus(code, text) {
    Assert.HTTPStatusCode(code);

    GuardNotThrow.statusSet(this.exchange, code);

    if (text !== undefined) {
      Assert.HeaderValue(text);
      GuardNotThrow.statusTextSet(this.exchange, text);
    }
  }

  get isFinished() {
    return GuardNotThrow.isFinished(this.exchange);
  }
}
