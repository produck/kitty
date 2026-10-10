import { SYMBOL } from '@produck/argot';
import Abstract, { Member as M } from '@produck/es-abstract';
import { SubConstructorOf } from '@produck/es-abstract-member-constructor';

import * as Assert from '../Parser.mjs';
import { I, _I, _S } from './_Symbol.mjs';
import * as Part from '../Part/index.mjs';
import * as Header from './Header/index.mjs';
import * as Body from './Body/index.mjs';

class AbstractResponse extends Part.Concrete {
  [I.HEADER] = null;
  [I.BODY] = null;

  constructor(exchange) {
    super(exchange);

    const TargetConstructor = this[SYMBOL.CONSTRUCTOR];

    this[I.HEADER] = new TargetConstructor[_S.HEADER_CTOR](exchange);
    this[I.BODY] = new TargetConstructor[_S.BODY_CTOR](exchange);
    Object.freeze(this);
  }

  get header() {
    return this[I.HEADER];
  }

  get body() {
    return this[I.BODY];
  }

  get statusCode() {
    return this[_I.STATUS.GET]();
  }

  get statusText() {
    return this[_I.STATUS_TEXT.GET]();
  }

  setStatus(code, text) {
    Assert.HTTPStatusCode(code);

    this[_I.STATUS.SET](code);

    if (text !== undefined) {
      Assert.HeaderValue(text);
      this[_I.STATUS_TEXT.SET](text);
    }
  }

  get isFinished() {
    return this[_I.IS_FINISHED]();
  }
}

export default Abstract(
  AbstractResponse,
  Abstract({
    [_I.STATUS.GET]: M.Method().returns(Assert.HTTPStatusCode),
    [_I.STATUS.SET]: M.Method()
      .args(Assert.HTTPStatusCode)
      .returns(M.Undefined),
    [_I.STATUS_TEXT.GET]: M.Method().returns(M.String),
    [_I.STATUS_TEXT.SET]: M.Method().args(M.String).returns(M.Undefined),
    [_I.IS_FINISHED]: M.Method().returns(M.Boolean),
  }),
  Abstract.Static({
    [_S.HEADER_CTOR]: SubConstructorOf(Header.Abstract),
    [_S.BODY_CTOR]: SubConstructorOf(Body.Abstract),
  }),
);
