import { deepFreeze } from '@produck/deep-freeze-enumerable';

import * as _Exchange from './Workflow/Exchange/index.mjs';
import * as _CompoundWorkflow from './CompoundWorkflow/index.mjs';
import * as _Deployer from './CompoundWorkflow/Deployer/index.mjs';
import * as _Plugin from './CompoundWorkflow/Plugin/index.mjs';
import * as _HttpExchange from './CompoundWorkflow/HttpExchange/index.mjs';
import * as _WebSocketExchange from './CompoundWorkflow/WebSocketExchange/index.mjs';

export const Abstract = deepFreeze({
  Workflow: _CompoundWorkflow.Abstract,
  Deployer: _Deployer.Abstract,
  Plugin: _Plugin.Abstract,
  Exchange: _Exchange.Abstract,
  ExchangeRequest: _Exchange.Request.Abstract,
  ExchangeRequestHeader: _Exchange.Request.Header.Abstract,
  ExchangeResponse: _Exchange.Response.Abstract,
  ExchangeResponseHeader: _Exchange.Response.Header.Abstract,
  ExchangeMutableResponse: _Exchange.MutableResponse.Abstract,
  ExchangeMutableHeader: _Exchange.Response.MutableHeader.Abstract,
  HttpExchange: _HttpExchange.Abstract,
  HttpRequest: _HttpExchange.Request.Abstract,
  HttpRequestBody: _HttpExchange.Request.Body.Abstract,
  HttpResponse: _HttpExchange.Response.Abstract,
  HttpResponseBody: _HttpExchange.Response.Body.Abstract,
  WebSocketExchange: _WebSocketExchange.Abstract,
  WebSocketController: _WebSocketExchange.Controller.Abstract,
  WebSocketResponse: _WebSocketExchange.Response.Abstract,
});

import * as COMPOUND_WORKFLOW from './CompoundWorkflow/_Symbol.mjs';
import * as DEPLOYER from './CompoundWorkflow/Deployer/_Symbol.mjs';
import * as PLUGIN from './CompoundWorkflow/Plugin/_Symbol.mjs';
import * as EXCHANGE from './Workflow/Exchange/_Symbol.mjs';
import * as EXCHANGE_REQUEST from './Workflow/Exchange/Request/_Symbol.mjs';
import * as EXCHANGE_REQUEST_HEADER from './Workflow/Exchange/Request/Header/_Symbol.mjs';
import * as EXCHANGE_RESPONSE from './Workflow/Exchange/Response/_Symbol.mjs';
import * as EXCHANGE_RESPONSE_HEADER from './Workflow/Exchange/Response/Header/_Symbol.mjs';
import * as EXCHANGE_RESPONSE_MUTABLE_HEADER from './Workflow/Exchange/Response/MutableHeader/_Symbol.mjs';
import * as EXCHANGE_MUTABLE_RESPONSE from './Workflow/Exchange/MutableResponse/_Symbol.mjs';
import * as HTTP_REQUEST from './CompoundWorkflow/HttpExchange/Request/_Symbol.mjs';
import * as HTTP_REQUEST_BODY from './CompoundWorkflow/HttpExchange/Request/Body/_Symbol.mjs';
import * as HTTP_RESPONSE from './CompoundWorkflow/HttpExchange/Response/_Symbol.mjs';
import * as HTTP_RESPONSE_BODY from './CompoundWorkflow/HttpExchange/Response/Body/_Symbol.mjs';
import * as WEB_SOCKET_EXCHANGE from './CompoundWorkflow/WebSocketExchange/_Symbol.mjs';
import * as WEB_SOCKET_CONTROLLER from './CompoundWorkflow/WebSocketExchange/Controller/_Symbol.mjs';

export const SYMBOL = deepFreeze({
  WORKFLOW: {
    _I: COMPOUND_WORKFLOW._I,
  },
  DEPLOYER: {
    _I: DEPLOYER._I,
    _S: DEPLOYER._S,
  },
  PLUGIN: {
    _I: PLUGIN._I,
    _S: PLUGIN._S,
  },
  EXCHANGE: {
    _I: EXCHANGE._I,
    _S: EXCHANGE._S,
  },
  EXCHANGE_REQUEST: {
    _I: EXCHANGE_REQUEST._I,
    _S: EXCHANGE_REQUEST._S,
  },
  EXCHANGE_REQUEST_HEADER: {
    _I: EXCHANGE_REQUEST_HEADER._I,
  },
  EXCHANGE_RESPONSE: {
    _I: EXCHANGE_RESPONSE._I,
    _S: EXCHANGE_RESPONSE._S,
  },
  EXCHANGE_RESPONSE_HEADER: {
    _I: EXCHANGE_RESPONSE_HEADER._I,
  },
  EXCHANGE_RESPONSE_MUTABLE_HEADER: {
    _I: EXCHANGE_RESPONSE_MUTABLE_HEADER._I,
  },
  EXCHANGE_MUTABLE_RESPONSE: {
    _I: EXCHANGE_MUTABLE_RESPONSE._I,
  },
  HTTP_REQUEST: {
    _S: HTTP_REQUEST._S,
  },
  HTTP_REQUEST_BODY: {
    _I: HTTP_REQUEST_BODY._I,
  },
  HTTP_RESPONSE: {
    _S: HTTP_RESPONSE._S,
  },
  HTTP_RESPONSE_BODY: {
    _I: HTTP_RESPONSE_BODY._I,
  },
  WEB_SOCKET_EXCHANGE: {
    _S: WEB_SOCKET_EXCHANGE._S,
  },
  WEB_SOCKET_CONTROLLER: {
    _I: WEB_SOCKET_CONTROLLER._I,
  },
});

export const DeployerRegistry = _Deployer.Registry;
export * from './Capability.mjs';
export * as Implement from './Implement/index.mjs';
