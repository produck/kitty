import * as net from 'node:net';

import { Is, ThrowTypeError } from '@produck/argot';
import { isSubConstructor } from '@produck/is-sub-constructor';

import * as HttpExchange from '../../CompoundWorkflow/HttpExchange/index.mjs';
import * as WebSocketExchange from '../../CompoundWorkflow/WebSocketExchange/index.mjs';

export default function normalizeDeployer(_options) {
  if (!Is.PlainObject(_options)) {
    ThrowTypeError('args[0]', 'plain object');
  }

  const {
    tag: _tag,
    server: _server,
    exchange: _exchange,
    install: _install,
  } = _options;

  const options = {};

  if (typeof _tag === 'string' && _tag.length > 0) {
    options.tag = _tag;
  } else {
    ThrowTypeError('args[0].tag', 'non-empty string');
  }

  if (isSubConstructor(_server, net.Server)) {
    options.server = _server;
  } else {
    ThrowTypeError('args[0].server', 'sub class of net.Server');
  }

  if (Is.PlainObject(_exchange)) {
    const exchange = (options.exchange = {});
    const { http: _http, webSocket: _webSocket } = _exchange;

    if (isSubConstructor(_http, HttpExchange.Abstract)) {
      exchange.http = _http;
    } else {
      ThrowTypeError('args[0].exchange.http', 'sub class of HttpExchange');
    }

    if (_webSocket !== undefined) {
      if (isSubConstructor(_webSocket, WebSocketExchange.Abstract)) {
        exchange.webSocket = _webSocket;
      } else {
        ThrowTypeError(
          'args[0].exchange.webSocket',
          'sub class of WebSocketExchange',
        );
      }
    }
  } else {
    ThrowTypeError('args[0].exchange', 'plain object');
  }

  if (typeof _install === 'function') {
    options.install = _install;
  } else {
    ThrowTypeError('args[0].install', 'function');
  }

  return options;
}
