import { SubConstructorProxy as SCP } from '@produck/es-abstract';

import * as Exchange from '../../Exchange/index.mjs';
import * as HttpExchange from '../../HttpExchange/index.mjs';

import * as EXCHANGE from '../../Exchange/_Symbol.mjs';
import * as PART from '../../Exchange/Part/_Symbol.mjs';
import * as REQUEST from '../../Exchange/Request/_Symbol.mjs';
import * as REQUEST_HEADER from '../../Exchange/Request/Header/_Symbol.mjs';
import * as RESPONSE from '../../Exchange/Response/_Symbol.mjs';
import * as RESPONSE_HEADER from '../../Exchange/Response/Header/_Symbol.mjs';
import * as HTTP_REQUEST from '../../HttpExchange/Request/_Symbol.mjs';
import * as HTTP_REQUEST_BODY from '../../HttpExchange/Request/Body/_Symbol.mjs';
import * as HTTP_RESPONSE from '../../HttpExchange/Response/_Symbol.mjs';
import * as HTTP_RESPONSE_BODY from '../../HttpExchange/Response/Body/_Symbol.mjs';

import * as Normalize from './Normalize/index.mjs';

const I_OPTIONS_CONTEXT = Symbol('.#optionsContext');

export function Http(options) {
  const {
    identity: { get: getIdentity },
    server: {
      get: getServer,
      protocol: { get: getServerProtocol },
    },
    httpVersion: { get: getHttpVersion },
    request: {
      method: { get: getRequestMethod },
      URL: { get: getRequestURL },
      header: { get: getRequestHeader, keys: getRequestHeaderKeys },
      body: {
        source: { get: getRequestBodySource },
      },
    },
    response: {
      status: { get: getResponseStatus, set: setResponseStatus },
      statusText: { get: getResponseStatusText, set: setResponseStatusText },
      finished: { is: isResponseFinished },
      header: {
        get: getResponseHeader,
        keys: getResponseHeaderKeys,
        set: setResponseHeader,
        delete: deleteResponseHeader,
      },
      body: {
        data: { set: setResponseBodyData },
      },
    },
  } = Normalize.Http(options);

  class ImplHttpRequestHeader extends Exchange.Request.Header.Abstract {
    [I_OPTIONS_CONTEXT] = Object.freeze({
      self: this,
      internal: this[PART.$I.INTERNAL],
    });

    constructor(...args) {
      super(...args);
      Object.freeze(this);
    }

    [REQUEST_HEADER._I.GET](_internal, key) {
      return getRequestHeader(this[I_OPTIONS_CONTEXT], key);
    }

    [REQUEST_HEADER._I.KEYS](_internal) {
      return getRequestHeaderKeys(this[I_OPTIONS_CONTEXT]);
    }
  }

  class ImplHttpRequestBody extends HttpExchange.Request.Body.Abstract {
    [I_OPTIONS_CONTEXT] = Object.freeze({
      self: this,
      internal: this[PART.$I.INTERNAL],
    });

    constructor(...args) {
      super(...args);
      Object.freeze(this);
    }

    [HTTP_REQUEST_BODY._I.SOURCE.GET](_internal) {
      return getRequestBodySource(this[I_OPTIONS_CONTEXT]);
    }
  }

  class ImplHttpResponseHeader extends Exchange.Response.Header.Abstract {
    [I_OPTIONS_CONTEXT] = Object.freeze({
      self: this,
      internal: this[PART.$I.INTERNAL],
    });

    constructor(...args) {
      super(...args);
      Object.freeze(this);
    }

    [RESPONSE_HEADER._I.GET](_internal, key) {
      return getResponseHeader(this[I_OPTIONS_CONTEXT], key);
    }

    [RESPONSE_HEADER._I.KEYS](_internal) {
      return getResponseHeaderKeys(this[I_OPTIONS_CONTEXT]);
    }

    [RESPONSE_HEADER._I.SET](_internal, key, value) {
      setResponseHeader(this[I_OPTIONS_CONTEXT], key, value);
    }

    [RESPONSE_HEADER._I.DELETE](_internal, key) {
      deleteResponseHeader(this[I_OPTIONS_CONTEXT], key);
    }
  }

  class ImplHttpResponseBody extends HttpExchange.Response.Body.Abstract {
    [I_OPTIONS_CONTEXT] = Object.freeze({
      self: this,
      internal: this[PART.$I.INTERNAL],
    });

    constructor(...args) {
      super(...args);
      Object.freeze(this);
    }

    [HTTP_RESPONSE_BODY._I.DATA.SET](_internal, value) {
      setResponseBodyData(this[I_OPTIONS_CONTEXT], value);
    }
  }

  class ImplHttpRequest extends HttpExchange.Request.Abstract {
    [I_OPTIONS_CONTEXT] = Object.freeze({
      self: this,
      internal: this[PART.$I.INTERNAL],
    });

    constructor(...args) {
      super(...args);
      Object.freeze(this);
    }

    static get [REQUEST._S.HEADER_CTOR]() {
      return Impl.RequestHeader;
    }

    static get [HTTP_REQUEST._S.BODY_CTOR]() {
      return Impl.RequestBody;
    }

    [REQUEST._I.METHOD.GET](_internal) {
      return getRequestMethod(this[I_OPTIONS_CONTEXT]);
    }

    [REQUEST._I.URL.GET](_internal) {
      return getRequestURL(this[I_OPTIONS_CONTEXT]);
    }
  }

  class ImplHttpResponse extends HttpExchange.Response.Abstract {
    [I_OPTIONS_CONTEXT] = Object.freeze({
      self: this,
      internal: this[PART.$I.INTERNAL],
    });

    constructor(...args) {
      super(...args);
      Object.freeze(this);
    }

    static get [RESPONSE._S.HEADER_CTOR]() {
      return Impl.ResponseHeader;
    }

    static get [HTTP_RESPONSE._S.BODY_CTOR]() {
      return Impl.ResponseBody;
    }

    [RESPONSE._I.STATUS.GET](_internal) {
      return getResponseStatus(this[I_OPTIONS_CONTEXT]);
    }

    [RESPONSE._I.STATUS.SET](_internal, code) {
      setResponseStatus(this[I_OPTIONS_CONTEXT], code);
    }

    [RESPONSE._I.STATUS_TEXT.GET](_internal) {
      return getResponseStatusText(this[I_OPTIONS_CONTEXT]);
    }

    [RESPONSE._I.STATUS_TEXT.SET](_internal, text) {
      setResponseStatusText(this[I_OPTIONS_CONTEXT], text);
    }

    [RESPONSE._I.IS_FINISHED](_internal) {
      return isResponseFinished(this[I_OPTIONS_CONTEXT]);
    }
  }

  class ImplHttpExchange extends HttpExchange.Abstract {
    [I_OPTIONS_CONTEXT] = Object.freeze({
      self: this,
      internal: this[EXCHANGE.I.INTERNAL],
    });

    constructor(...args) {
      super(...args);
      Object.freeze(this);
    }

    static get [EXCHANGE._S.REQUEST_CTOR]() {
      return Impl.Request;
    }

    static get [EXCHANGE._S.RESPONSE_CTOR]() {
      return Impl.Response;
    }

    [EXCHANGE._I.IDENTITY.GET](_internal) {
      return getIdentity(this[I_OPTIONS_CONTEXT]);
    }

    [EXCHANGE._I.SERVER.GET](_internal) {
      return getServer(this[I_OPTIONS_CONTEXT]);
    }

    [EXCHANGE._I.SERVER.PROTOCOL.GET](_internal) {
      return getServerProtocol(this[I_OPTIONS_CONTEXT]);
    }

    [EXCHANGE._I.HTTP_VERSION](_internal) {
      return getHttpVersion(this[I_OPTIONS_CONTEXT]);
    }
  }

  const Impl = {
    RequestHeader: SCP(ImplHttpRequestHeader),
    RequestBody: SCP(ImplHttpRequestBody),
    ResponseHeader: SCP(ImplHttpResponseHeader),
    ResponseBody: SCP(ImplHttpResponseBody),
    Request: SCP(ImplHttpRequest),
    Response: SCP(ImplHttpResponse),
    Exchange: SCP(ImplHttpExchange),
  };

  return Impl.Exchange;
}
