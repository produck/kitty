import { SubConstructorProxy as SCP } from '@produck/es-abstract';

import * as Request from '../Request/index.mjs';
import * as RequestBody from '../Request/Body/index.mjs';
import * as RequestHeader from '../Request/Header/index.mjs';
import * as Response from '../Response/index.mjs';
import * as ResponseBody from '../Response/Body/index.mjs';
import * as ResponseHeader from '../Response/Header/index.mjs';
import AbstractExchange from '../_Abstract.mjs';

import { PART } from '../Request/_Borrow.mjs';
import { REQUEST, REQUEST_BODY, REQUEST_HEADER } from '../_Borrow.mjs';
import { RESPONSE, RESPONSE_BODY, RESPONSE_HEADER } from '../_Borrow.mjs';
import * as EXCHANGE from '../_Symbol.mjs';

import normalize from './Normalize.mjs';

const I_OPTIONS_CONTEXT = Symbol('.#optionsContext');

export function Implement(options) {
  const {
    identity: { get: getIdentity },
    server: {
      get: getServer,
      protocol: { get: getServerProtocol },
    },
    httpVersion: { get: getHttpVersion },
    request: {
      mode: { get: getRequestMode },
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
  } = normalize(options);

  class ImplementedRequestHeader extends RequestHeader.Abstract {
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

  class ImplementedRequestBody extends RequestBody.Abstract {
    [I_OPTIONS_CONTEXT] = Object.freeze({
      self: this,
      internal: this[PART.$I.INTERNAL],
    });

    constructor(...args) {
      super(...args);
      Object.freeze(this);
    }

    [REQUEST_BODY._I.SOURCE.GET](_internal) {
      return getRequestBodySource(this[I_OPTIONS_CONTEXT]);
    }
  }

  class ImplementedResponseHeader extends ResponseHeader.Abstract {
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

  class ImplementedResponseBody extends ResponseBody.Abstract {
    [I_OPTIONS_CONTEXT] = Object.freeze({
      self: this,
      internal: this[PART.$I.INTERNAL],
    });

    constructor(...args) {
      super(...args);
      Object.freeze(this);
    }

    [RESPONSE_BODY._I.DATA.SET](_internal, value) {
      setResponseBodyData(this[I_OPTIONS_CONTEXT], value);
    }
  }

  class ImplementedRequest extends Request.Abstract {
    [I_OPTIONS_CONTEXT] = Object.freeze({
      self: this,
      internal: this[PART.$I.INTERNAL],
    });

    constructor(...args) {
      super(...args);
      Object.freeze(this);
    }

    static get [REQUEST._S.HEADER_CTOR]() {
      return Implemented.RequestHeader;
    }

    static get [REQUEST._S.BODY_CTOR]() {
      return Implemented.RequestBody;
    }

    [REQUEST._I.MODE.GET](_internal) {
      return getRequestMode(this[I_OPTIONS_CONTEXT]);
    }

    [REQUEST._I.METHOD.GET](_internal) {
      return getRequestMethod(this[I_OPTIONS_CONTEXT]);
    }

    [REQUEST._I.URL.GET](_internal) {
      return getRequestURL(this[I_OPTIONS_CONTEXT]);
    }
  }

  class ImplementedResponse extends Response.Abstract {
    [I_OPTIONS_CONTEXT] = Object.freeze({
      self: this,
      internal: this[PART.$I.INTERNAL],
    });

    constructor(...args) {
      super(...args);
      Object.freeze(this);
    }

    static get [RESPONSE._S.HEADER_CTOR]() {
      return Implemented.ResponseHeader;
    }

    static get [RESPONSE._S.BODY_CTOR]() {
      return Implemented.ResponseBody;
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

  class ImplementedExchange extends AbstractExchange {
    [I_OPTIONS_CONTEXT] = Object.freeze({
      self: this,
      internal: this[EXCHANGE.I.INTERNAL],
    });

    constructor(...args) {
      super(...args);
      Object.freeze(this);
    }

    static get [EXCHANGE._S.REQUEST_CTOR]() {
      return Implemented.Request;
    }

    static get [EXCHANGE._S.RESPONSE_CTOR]() {
      return Implemented.Response;
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

    [EXCHANGE._I.HTTP_VERSION.GET](_internal) {
      return getHttpVersion(this[I_OPTIONS_CONTEXT]);
    }
  }

  const Implemented = {
    RequestHeader: SCP(ImplementedRequestHeader),
    RequestBody: SCP(ImplementedRequestBody),
    ResponseHeader: SCP(ImplementedResponseHeader),
    ResponseBody: SCP(ImplementedResponseBody),
    Request: SCP(ImplementedRequest),
    Response: SCP(ImplementedResponse),
    Exchange: SCP(ImplementedExchange),
  };

  return Implemented.Exchange;
}
