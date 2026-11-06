import { Ow } from '@produck/argot';

import * as Cookie from '../Cookie/index.mjs';
import { COOKIE } from './_Borrow.mjs';
import { I } from './_Symbol.mjs';

export default class ExchangeCookie extends Cookie.Abstract {
  constructor(exchange) {
    super();
    this[I.EXCHANGE] = exchange;
  }

  [COOKIE._I.READ]() {
    return this[I.EXCHANGE].request.header.get('cookie') ?? '';
  }

  [COOKIE._I.WRITE](line) {
    const { response } = this[I.EXCHANGE];

    if (response === undefined) {
      Ow.Error.Common('The exchange has no response.');
    }

    response.header.append('set-cookie', line);
  }
}
