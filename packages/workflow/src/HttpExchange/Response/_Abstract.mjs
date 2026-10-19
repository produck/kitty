import { SYMBOL } from '@produck/argot';
import Abstract from '@produck/es-abstract';
import { SubConstructorOf } from '@produck/es-abstract-member-constructor';

import * as Exchange from '../../Exchange/index.mjs';
import * as Body from './Body/index.mjs';
import { I, _S } from './_Symbol.mjs';

class HttpResponse extends Exchange.Response.Abstract {
  constructor(exchange) {
    super(exchange);
    this[I.BODY] = new this[SYMBOL.CONSTRUCTOR][_S.BODY_CTOR](exchange);
  }

  get body() {
    return this[I.BODY];
  }
}

export default Abstract(
  HttpResponse,
  Abstract.Static({
    [_S.BODY_CTOR]: SubConstructorOf(Body.Abstract),
  }),
);
