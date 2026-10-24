import * as net from 'node:net';

import { Ow, SYMBOL, ThrowTypeError } from '@produck/argot';
import Abstract, { Member as M, ShadowThis as $ } from '@produck/es-abstract';
import { SubConstructorOf as M_Sub } from '@produck/es-abstract-member-constructor';
import * as Kit from '@produck/kit';

import * as Request from './Request/index.mjs';
import * as Response from './Response/index.mjs';
import * as P from './_Parser.mjs';
import { DEPLOYMENT } from './_Borrow.mjs';
import { I, $I, $S, _I, _S } from './_Symbol.mjs';

export const K_EXCHANGE = Symbol('ExchangeKit.exchange');
export const K_REQUEST = Symbol('ExchangeKit.request');
export const K_RESPONSE = Symbol('ExchangeKit.response');

class Exchange extends EventTarget {
  [I.DEPLOYMENT] = null;
  [I.INTERNAL] = null;
  [I.REQUEST] = null;
  [I.RESPONSE] = null;

  constructor(DeploymentKit, deployment, { internal }) {
    super();

    if (!Kit.isKit(DeploymentKit)) {
      ThrowTypeError('args[0] as DeploymentKit', 'Kit');
    }

    const ExchangeKit = DeploymentKit('Kitty<Exchange>');

    ExchangeKit[K_EXCHANGE] = $(this);
    this[I.KIT] = ExchangeKit;
    this[I.DEPLOYMENT] = deployment;
    this[I.INTERNAL] = internal;
    this[SYMBOL.CONSTRUCTOR] = new.target;
    this[I.REQUEST] = new this[SYMBOL.CONSTRUCTOR][_S.REQUEST_CTOR]($(this));
    this[I.RESPONSE] = new this[SYMBOL.CONSTRUCTOR][_S.RESPONSE_CTOR]($(this));

    ExchangeKit[K_REQUEST] = this[I.REQUEST];
    ExchangeKit[K_RESPONSE] = this[I.RESPONSE];
  }

  get [$I.KIT]() {
    return this[I.KIT];
  }

  get [$I.DEPLOYMENT]() {
    return this[I.DEPLOYMENT];
  }

  get [$I.INTERNAL]() {
    return this[I.INTERNAL];
  }

  get workflow() {
    return this[I.DEPLOYMENT][DEPLOYMENT.$I.WORKFLOW];
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

  static [$S.IDENTITY](internal) {
    return this[_S.IDENTITY](internal);
  }
}

export default Abstract(
  Exchange,
  Abstract({
    [_I.HTTP_VERSION]: M.Method().args(M.Any).returns(P.HttpVersion),
    [_I.MODE]: M.Method().args(M.Any).returns(P.ExchangeMode),
    [_I.SERVER.GET]: M.Method().args(M.Any).returns(M.Instance(net.Server)),
    [_I.SERVER.PROTOCOL.GET]: M.Method().args(M.Any).returns(P.ServerProtocol),
  }),
  Abstract.Static({
    [_S.IDENTITY]: M.Method().args(M.Any).returns(M.Object),
    [_S.REQUEST_CTOR]: M_Sub(Request.Abstract),
    [_S.RESPONSE_CTOR]: M_Sub(Response.Abstract),
  }),
);
