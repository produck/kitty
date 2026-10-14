import * as net from 'node:net';

import { Ow, SYMBOL } from '@produck/argot';
import Abstract, { Member as M, ShadowThis as $ } from '@produck/es-abstract';
import { SubConstructorOf } from '@produck/es-abstract-member-constructor';

import { K_EXCHANGE, useWorkflow } from '../Capability.mjs';
import * as P from './Parser.mjs';
import { I, $I, _I, _S } from './_Symbol.mjs';
import * as Request from './Request/index.mjs';
import * as Response from './Response/index.mjs';
import { Get } from '../Configuration/index.mjs';

class KittyExchange extends EventTarget {
  [I.REQUEST] = null;
  [I.RESPONSE] = null;

  constructor(ExchangeKit, internal) {
    super();

    ExchangeKit[K_EXCHANGE] = $(this);
    this[$I.KIT] = ExchangeKit;
    this[I.INTERNAL] = internal;
    this[I.REQUEST] = new this[SYMBOL.CONSTRUCTOR][_S.REQUEST_CTOR]($(this));
    this[I.RESPONSE] = new this[SYMBOL.CONSTRUCTOR][_S.RESPONSE_CTOR]($(this));

    this[I.START_TIMING]();
  }

  [I.START_TIMING]() {
    const workflow = useWorkflow(this[$I.KIT]);
    const maxExchangeTimeout = Get.getMaxExchangeTimeout(workflow);

    const timer = setTimeout(() => {
      if (!this.response.isFinished) {
        this.setStatus(503);
      }
    }, maxExchangeTimeout);

    this.addEventListener('close', () => clearTimeout(timer), { once: true });
  }

  get [$I.IDENTITY]() {
    return this[_I.IDENTITY.GET](this[I.INTERNAL]);
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

  get mode() {
    return this.request.mode;
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

  get httpVersion() {
    return this[_I.HTTP_VERSION.GET](this[I.INTERNAL]);
  }
}

export default Abstract(
  KittyExchange,
  Abstract({
    [_I.IDENTITY.GET]: M.Method().args().rest(M.Any).returns(M.Object),
    [_I.SERVER.GET]: M.Method().args(M.Any).returns(M.Instance(net.Server)),
    [_I.SERVER.PROTOCOL.GET]: M.Method().args(M.Any).returns(P.ServerProtocol),
    [_I.HTTP_VERSION.GET]: M.Method().args(M.Any).returns(P.HttpVersion),
  }),
  Abstract.Static({
    [_S.REQUEST_CTOR]: SubConstructorOf(Request.Abstract),
    [_S.RESPONSE_CTOR]: SubConstructorOf(Response.Abstract),
  }),
);
