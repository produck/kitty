import { Ow } from '@produck/argot';

import * as Bridge from '../Bridge.mjs';
import * as Cookie from '../Cookie/index.mjs';
import { COOKIE } from './_Borrow.mjs';
import { I } from './_Symbol.mjs';

export default class ExchangeCookie extends Cookie.Abstract {
  constructor(exchange) {
    super();
    this[I.EXCHANGE] = exchange;
  }

  get [COOKIE._I.DEFAULTS]() {
    const workflow = this[I.EXCHANGE].workflow;

    if (!Bridge.hasConfiguration(workflow)) {
      Ow.Error.Common('The cookie plugin is not installed.');
    }

    return { ...Bridge.getConfiguration(workflow) };
  }

  [COOKIE._I.READ]() {
    return this[I.EXCHANGE].request.header.get('cookie') ?? '';
  }

  [COOKIE._I.WRITE](line) {
    const exchange = this[I.EXCHANGE];

    if (exchange.mode !== 'http') {
      Ow.Error.Common('The cookie can only be written on an HTTP exchange.');
    }

    exchange.response.header.append('set-cookie', line);
  }
}
