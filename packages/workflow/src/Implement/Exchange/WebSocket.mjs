import { SubConstructorProxy as SCP } from '@produck/es-abstract';

import * as Exchange from '../../Workflow/Exchange/index.mjs';
import * as WebSocketExchange from '../../CompoundWorkflow/WebSocketExchange/index.mjs';

import * as CONTROLLER from '../../CompoundWorkflow/WebSocketExchange/Controller/_Symbol.mjs';
import * as EXCHANGE from '../../Workflow/Exchange/_Symbol.mjs';
import * as WEB_SOCKET_EXCHANGE from '../../CompoundWorkflow/WebSocketExchange/_Symbol.mjs';
import * as PART from '../../Workflow/Exchange/Part/_Symbol.mjs';
import * as REQUEST from '../../Workflow/Exchange/Request/_Symbol.mjs';
import * as REQUEST_HEADER from '../../Workflow/Exchange/Request/Header/_Symbol.mjs';
import * as RESPONSE from '../../Workflow/Exchange/Response/_Symbol.mjs';
import * as RESPONSE_HEADER from '../../Workflow/Exchange/Response/Header/_Symbol.mjs';

import * as Normalize from './Normalize/index.mjs';

const I_OPTIONS_CONTEXT = Symbol('.#optionsContext');

export function WebSocket(options) {
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
    },
    response: {
      status: { get: getResponseStatus },
      statusText: { get: getResponseStatusText },
      header: { get: getResponseHeader, keys: getResponseHeaderKeys },
    },
    controller: {
      readyState: { get: getControllerReadyState },
      send: { send: sendController },
      close: { close: closeController },
    },
  } = Normalize.WebSocket(options);

  class ImplWebSocketRequestHeader extends Exchange.Request.Header.Abstract {
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

  class ImplWebSocketResponseHeader extends Exchange.Response.Header.Abstract {
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
  }

  class ImplWebSocketController extends WebSocketExchange.Controller.Abstract {
    [I_OPTIONS_CONTEXT] = Object.freeze({
      self: this,
      internal: this[PART.$I.INTERNAL],
    });

    constructor(...args) {
      super(...args);
      Object.freeze(this);
    }

    [CONTROLLER._I.READY_STATE.GET](_internal) {
      return getControllerReadyState(this[I_OPTIONS_CONTEXT]);
    }

    [CONTROLLER._I.SEND](_internal, data) {
      sendController(this[I_OPTIONS_CONTEXT], data);
    }

    [CONTROLLER._I.CLOSE](_internal, code, reason) {
      closeController(this[I_OPTIONS_CONTEXT], code, reason);
    }
  }

  class ImplWebSocketRequest extends Exchange.Request.Abstract {
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

    [REQUEST._I.METHOD.GET](_internal) {
      return getRequestMethod(this[I_OPTIONS_CONTEXT]);
    }

    [REQUEST._I.URL.GET](_internal) {
      return getRequestURL(this[I_OPTIONS_CONTEXT]);
    }
  }

  class ImplWebSocketResponse extends WebSocketExchange.Response.Abstract {
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

    [RESPONSE._I.STATUS.GET](_internal) {
      return getResponseStatus(this[I_OPTIONS_CONTEXT]);
    }

    [RESPONSE._I.STATUS_TEXT.GET](_internal) {
      return getResponseStatusText(this[I_OPTIONS_CONTEXT]);
    }
  }

  class ImplWebSocketExchange extends WebSocketExchange.Abstract {
    [I_OPTIONS_CONTEXT] = Object.freeze({
      self: this,
      internal: this[EXCHANGE.$I.INTERNAL],
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

    static get [WEB_SOCKET_EXCHANGE._S.CONTROLLER_CTOR]() {
      return Impl.Controller;
    }

    static [EXCHANGE._S.IDENTITY](internal) {
      return getIdentity(internal);
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
    RequestHeader: SCP(ImplWebSocketRequestHeader),
    ResponseHeader: SCP(ImplWebSocketResponseHeader),
    Controller: SCP(ImplWebSocketController),
    Request: SCP(ImplWebSocketRequest),
    Response: SCP(ImplWebSocketResponse),
    Exchange: SCP(ImplWebSocketExchange),
  };

  return Impl.Exchange;
}
