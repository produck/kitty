import * as net from 'node:net';
import { Readable } from 'node:stream';
import * as Ow from '@produck/ow';
import { ThrowTypeError } from '@produck/type-error';
import Abstract, { Member as M } from '@produck/es-abstract';
import * as Kit from '@produck/kit';

import * as P from './Parser.mjs';
import { _I, $I } from './_Symbol.mjs';
import * as Request from './Request/index.mjs';
import * as Response from './Response/index.mjs';
import { useConfig } from './Config.mjs';

const CONSUMED_IDENTITY = new WeakSet();

class KittyExchange extends EventTarget {
  exchange = this;

  constructor(ExchangeKit) {
    if (!Kit.isKit(ExchangeKit)) {
      ThrowTypeError('args[0] as ExchangeKit', 'Kit');
    }

    super();
    this[$I.KIT] = ExchangeKit;

    const identity = this[_I.IDENTITY.GET]();

    if (CONSUMED_IDENTITY.has(identity)) {
      Ow.Error.Common('Adapter identity object has already been consumed.');
    }

    CONSUMED_IDENTITY.add(identity);
    this.request = new Request.Concrete(this);
    this.response = new Response.Concrete(this);

    const config = useConfig(ExchangeKit);

    const timer = setTimeout(() => {
      if (!this.isFinished) {
        this.setStatus(503);
      }
    }, config.timeout * 1000);

    this.addEventListener('close', () => clearTimeout(timer), { once: true });

    Object.freeze(this);
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

  get isConsumed() {
    return this.request.isConsumed;
  }

  get isFinished() {
    return this.response.isFinished;
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

// prettier-ignore
export default Abstract(KittyExchange, ...[
  Abstract({
    [_I.IDENTITY.GET]: M.Method().args().rest(M.Any).returns(M.Object),
    [_I.SERVER.GET]: M.Method().returns(M.Instance(net.Server)),
    [_I.SERVER.PROTOCOL.GET]: M.Method().returns(P.ServerProtocol),
    [_I.HTTP_VERSION.GET]: M.Method().returns(P.HttpVersion),
    [_I.STATUS.GET]: M.Method().returns(P.HTTPStatusCode),
    [_I.STATUS.SET]: M.Method()
      .args(P.HTTPStatusCode)
      .returns(M.Undefined),
  }),
  Abstract({
    [_I.REQUEST.MODE.GET]: M.Method().returns(P.ExchangeMode),
    [_I.REQUEST.METHOD.GET]: M.Method().returns(P.HttpMethod),
    [_I.REQUEST.URL.GET]: M.Method().returns(M.String),
    [_I.REQUEST.HEADER.GET]: M.Method().args(M.String).returns(M.String),
    [_I.REQUEST.HEADER.KEYS]: M.Method().returns(P.Iterable),
    [_I.REQUEST.IS_CONSUMED]: M.Method().returns(M.Boolean),
    [_I.REQUEST.BODY.DATA.GET]: M.Method().returns(M.Instance(Readable)),
  }),
  Abstract({
    [_I.RESPONSE.HEADER.GET]: M.Method().args(M.String).returns(M.String),
    [_I.RESPONSE.HEADER.KEYS]: M.Method().returns(P.Iterable),
    [_I.RESPONSE.HEADER.SET]: M.Method()
      .args(M.String, M.String)
      .returns(M.Undefined),
    [_I.RESPONSE.HEADER.DELETE]: M.Method().args(M.String).returns(M.Undefined),
    [_I.RESPONSE.STATUS_TEXT.GET]: M.Method().returns(M.String),
    [_I.RESPONSE.STATUS_TEXT.SET]: M.Method()
      .args(M.String)
      .returns(M.Undefined),
    [_I.RESPONSE.BODY.DATA.GET]: M.Method().returns(M.Any),
    [_I.RESPONSE.BODY.DATA.SET]: M.Method().args(M.Any).returns(M.Undefined),
    [_I.RESPONSE.IS_FINISHED]: M.Method().returns(M.Boolean),
  }),
]);
