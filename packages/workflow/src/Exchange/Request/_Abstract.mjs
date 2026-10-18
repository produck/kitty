import { Ow, SYMBOL } from '@produck/argot';
import Abstract, { Member as M } from '@produck/es-abstract';
import { SubConstructorOf } from '@produck/es-abstract-member-constructor';

import * as Configuration from '../../Configuration/index.mjs';
import * as P from './Parser.mjs';
import { I, _I, _S } from './_Symbol.mjs';
import { PART } from './_Borrow.mjs';
import * as Part from '../Part/index.mjs';
import * as Header from './Header/index.mjs';
import * as Body from './Body/index.mjs';
import { ThrowAdapter } from '../Utils.mjs';

class Request extends Part.Concrete {
  [I.HEADER] = null;
  [I.BODY] = null;

  constructor(exchange) {
    super(exchange);
    this[I.HEADER] = new this[SYMBOL.CONSTRUCTOR][_S.HEADER_CTOR](exchange);
    this[I.BODY] = new this[SYMBOL.CONSTRUCTOR][_S.BODY_CTOR](exchange);
  }

  get header() {
    return this[I.HEADER];
  }

  get body() {
    const { method, workflow } = this;
    const allowed = Configuration.Get.AllowedBodyMethods(workflow);

    if (!allowed.includes(method)) {
      Ow.Error.Common(`It MUST NOT read a body for the ${method} method.`);
    }

    return this[I.BODY];
  }

  get method() {
    return this[_I.METHOD.GET](this[PART.$I.INTERNAL]);
  }

  get url() {
    const raw = this[_I.URL.GET](this[PART.$I.INTERNAL]);

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
}

export default Abstract(
  Request,
  Abstract({
    [_I.METHOD.GET]: M.Method().args(M.Any).returns(P.HttpMethod),
    [_I.URL.GET]: M.Method().args(M.Any).returns(M.String),
  }),
  Abstract.Static({
    [_S.HEADER_CTOR]: SubConstructorOf(Header.Abstract),
    [_S.BODY_CTOR]: SubConstructorOf(Body.Abstract),
  }),
);
