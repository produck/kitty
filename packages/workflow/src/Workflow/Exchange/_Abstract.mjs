import * as net from 'node:net';

import { Ow, SYMBOL, ThrowTypeError } from '@produck/argot';
import Abstract, { Member as M, ShadowThis as $ } from '@produck/es-abstract';
import { SubConstructorOf } from '@produck/es-abstract-member-constructor';
import * as Kit from '@produck/kit';

import { K_EXCHANGE, useWorkflow } from '../../Capability.mjs';
import * as P from './_Parser.mjs';
import { I, $I, _I, _S } from './_Symbol.mjs';
import * as Request from './Request/index.mjs';
import * as Response from './Response/index.mjs';

class Exchange extends EventTarget {
  [I.INTERNAL] = null;
  [I.REQUEST] = null;
  [I.RESPONSE] = null;

  constructor(ExchangeKit, internal) {
    super();

    if (!Kit.isKit(ExchangeKit)) {
      ThrowTypeError('args[0] as ExchangeKit', 'Kit');
    }

    ExchangeKit[K_EXCHANGE] = $(this);
    this[I.KIT] = ExchangeKit;
    this[I.INTERNAL] = internal;
    this[SYMBOL.CONSTRUCTOR] = new.target;
    this[I.REQUEST] = new this[SYMBOL.CONSTRUCTOR][_S.REQUEST_CTOR]($(this));
    this[I.RESPONSE] = new this[SYMBOL.CONSTRUCTOR][_S.RESPONSE_CTOR]($(this));
  }

  get [$I.KIT]() {
    return this[I.KIT];
  }

  get [$I.IDENTITY]() {
    return this[_I.IDENTITY.GET](this[I.INTERNAL]);
  }

  get [$I.INTERNAL]() {
    return this[I.INTERNAL];
  }

  get workflow() {
    return useWorkflow(this[$I.KIT]);
  }

  get request() {
    return this[I.REQUEST];
  }

  get response() {
    return this[I.RESPONSE];
  }

  toJSON() {
    Ow.Error.Common('Exchange object cannot be serialized.');
  }

  get method() {
    return this.request.method;
  }

  get url() {
    return this.request.url;
  }

  get statusCode() {
    return this.response.statusCode;
  }

  get statusText() {
    return this.response.statusText;
  }

  setStatus(code, text) {
    this.response.setStatus(code, text);
  }

  get server() {
    return this[_I.SERVER.GET](this[I.INTERNAL]);
  }

  get protocol() {
    return this[_I.SERVER.PROTOCOL.GET](this[I.INTERNAL]);
  }

  get mode() {
    return this[_I.MODE](this[I.INTERNAL]);
  }

  get httpVersion() {
    return this[_I.HTTP_VERSION](this[I.INTERNAL]);
  }
}

export default Abstract(
  Exchange,
  Abstract({
    [_I.HTTP_VERSION]: M.Method().args(M.Any).returns(P.HttpVersion),
    [_I.IDENTITY.GET]: M.Method().args().rest(M.Any).returns(M.Object),
    [_I.MODE]: M.Method().args(M.Any).returns(P.ExchangeMode),
    [_I.SERVER.GET]: M.Method().args(M.Any).returns(M.Instance(net.Server)),
    [_I.SERVER.PROTOCOL.GET]: M.Method().args(M.Any).returns(P.ServerProtocol),
  }),
  Abstract.Static({
    [_S.REQUEST_CTOR]: SubConstructorOf(Request.Abstract),
    [_S.RESPONSE_CTOR]: SubConstructorOf(Response.Abstract),
  }),
);
