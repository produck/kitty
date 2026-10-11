import * as net from 'node:net';

import { Ow, SYMBOL } from '@produck/argot';
import Abstract, { Member as M } from '@produck/es-abstract';
import { SubConstructorOf } from '@produck/es-abstract-member-constructor';

import * as P from './Parser.mjs';
import { I, $I, _I, _S } from './_Symbol.mjs';
import * as Request from './Request/index.mjs';
import * as Response from './Response/index.mjs';
import { useConfig } from './Config.mjs';

class KittyExchange extends EventTarget {
  [I.REQUEST] = null;
  [I.RESPONSE] = null;

  constructor(ExchangeKit, internal) {
    super();

    const TargetConstructor = new.target;

    this[SYMBOL.CONSTRUCTOR] = TargetConstructor;
    this[$I.KIT] = ExchangeKit;
    this[I.INTERNAL] = internal;
    this[I.REQUEST] = new TargetConstructor[_S.REQUEST_CTOR](this);
    this[I.RESPONSE] = new TargetConstructor[_S.RESPONSE_CTOR](this);

    this[I.START_TIMING]();
  }

  [I.START_TIMING]() {
    const config = useConfig(this[$I.KIT]);

    const timer = setTimeout(() => {
      if (!this.response.isFinished) {
        this.setStatus(503);
      }
    }, config.timeout * 1000);

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
    return this[_I.SERVER.GET]();
  }

  get protocol() {
    return this[_I.SERVER.PROTOCOL.GET]();
  }

  get httpVersion() {
    return this[_I.HTTP_VERSION.GET]();
  }
}

export default Abstract(
  KittyExchange,
  Abstract({
    [_I.IDENTITY.GET]: M.Method().args().rest(M.Any).returns(M.Object),
    [_I.SERVER.GET]: M.Method().returns(M.Instance(net.Server)),
    [_I.SERVER.PROTOCOL.GET]: M.Method().returns(P.ServerProtocol),
    [_I.HTTP_VERSION.GET]: M.Method().returns(P.HttpVersion),
  }),
  Abstract.Static({
    [_S.REQUEST_CTOR]: SubConstructorOf(Request.Abstract),
    [_S.RESPONSE_CTOR]: SubConstructorOf(Response.Abstract),
  }),
);
