import * as P from './_Parser.mjs';
import { I } from './_Symbol.mjs';

const HEADER_NAME = 'forwarded';

export default class Forwarded {
  constructor(exchange, trustedList) {
    this[I.EXCHANGE] = exchange;
    this[I.REMOTE] = trustedList;

    this.entryList = () => this[I.ENTRY_LIST]();
    this.client = () => this[I.CLIENT]();
    this.protocol = () => this[I.PROTOCOL]();
  }

  [I.ENTRY_LIST]() {
    const value = this[I.EXCHANGE].request.header.get(HEADER_NAME);

    return P.ForwardedList(value);
  }

  [I.CLIENT]() {
    const entryList = this[I.ENTRY_LIST]();

    return entryList.length === 0 ? null : (entryList[0].for ?? null);
  }

  [I.PROTOCOL]() {
    const entryList = this[I.ENTRY_LIST]();

    return entryList.length === 0 ? null : (entryList[0].proto ?? null);
  }
}
