import { SYMBOL } from '@produck/argot';
import Abstract, { Member as M } from '@produck/es-abstract';
import { SubConstructorOf } from '@produck/es-abstract-member-constructor';

import * as Assert from '../Parser.mjs';
import { I, _I, _S } from './_Symbol.mjs';
import { PART } from './_Borrow.mjs';
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
    return this[_I.STATUS.GET](this[PART.$I.INTERNAL]);
  }

  get statusText() {
    return this[_I.STATUS_TEXT.GET](this[PART.$I.INTERNAL]);
  }

  setStatus(code, text) {
    Assert.HTTPStatusCode(code);

    this[_I.STATUS.SET](this[PART.$I.INTERNAL], code);

    if (text !== undefined) {
      Assert.HeaderValue(text);
      this[_I.STATUS_TEXT.SET](this[PART.$I.INTERNAL], text);
    }
  }

  get isFinished() {
    return this[_I.IS_FINISHED](this[PART.$I.INTERNAL]);
  }
}

export default Abstract(
  AbstractResponse,
  Abstract({
    [_I.STATUS.GET]: M.Method().args(M.Any).returns(Assert.HTTPStatusCode),
    [_I.STATUS.SET]: M.Method()
      .args(M.Any, Assert.HTTPStatusCode)
      .returns(M.Undefined),
    [_I.STATUS_TEXT.GET]: M.Method().args(M.Any).returns(M.String),
    [_I.STATUS_TEXT.SET]: M.Method().args(M.Any, M.String).returns(M.Undefined),
    [_I.IS_FINISHED]: M.Method().args(M.Any).returns(M.Boolean),
  }),
  Abstract.Static({
    [_S.HEADER_CTOR]: SubConstructorOf(Header.Abstract),
    [_S.BODY_CTOR]: SubConstructorOf(Body.Abstract),
  }),
);
