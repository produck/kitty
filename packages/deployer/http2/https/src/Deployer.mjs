import { Ow } from '@produck/argot';
import { Implement, SYMBOL, useServer } from '@produck/kitty-workflow';
import * as Http2Http from '@produck/kitty-deployer-http2-http';

import * as Bridge from './Bridge.mjs';
import * as Exchange from './Exchange/index.mjs';
import { Http2SecureServer } from './Intrinsic.mjs';

const http2 = Http2Http.Exchange.Http.options;

function isConnect(headers) {
  return headers[':method'] === 'CONNECT';
}

function enableConnectProtocol(session) {
  session.settings({ enableConnectProtocol: true });
}

export const options = Implement.Normalize.Deployer({
  tag: '1,2:https',
  server: Http2SecureServer,
  exchange: { http: Exchange.Http.Exchange },
  install({
    Kit,
    handleHttpExchange,
    handleWebSocketExchange,
    hasWebSocketExchange,
    declareToManifest,
    setServerLinker,
  }) {
    const server = useServer(Kit);
    const hasWebSocket = hasWebSocketExchange();

    async function requestListener(req, res) {
      if (req.httpVersion === '2.0') {
        return;
      }

      await handleHttpExchange({ server, req, res });

      if (!Bridge.hasWritten(res) && !res.writableEnded) {
        res.end();
      }
    }

    async function streamListener(stream, headers) {
      const internal = { server, stream, headers };

      if (isConnect(headers)) {
        return;
      }

      await handleHttpExchange(internal);

      if (stream.headersSent || stream.writableEnded || stream.destroyed) {
        return;
      }

      const status = http2.response.status.get({ internal });

      stream.respond({ ':status': status });
      stream.end();
    }

    async function connectListener(request, response) {
      await handleWebSocketExchange({
        server,
        stream: response.stream,
        headers: request.headers,
      });
    }

    async function upgradeListener(req, socket, head) {
      await handleWebSocketExchange({ server, req, socket, head });
    }

    declareToManifest('request-listener', requestListener);
    declareToManifest('stream-listener', streamListener);

    if (hasWebSocket) {
      declareToManifest('connect-listener', connectListener);
      declareToManifest('upgrade-listener', upgradeListener);
      declareToManifest('session-listener', enableConnectProtocol);
    }

    setServerLinker((_context, next) => {
      server.on('request', requestListener);
      server.on('stream', streamListener);

      if (hasWebSocket) {
        server.on('connect', connectListener);
        server.on('upgrade', upgradeListener);
        server.on('session', enableConnectProtocol);
      }

      return next();
    });
  },
});

export class Http2HttpsDeployer extends Implement.Deployer(options) {
  static withWebSocketExchange(WebSocketExchange) {
    return class Http2WithWebSocketDeployer extends this {
      static get [SYMBOL.DEPLOYER._S.TAG]() {
        return '1,2:https,websocket';
      }

      static get [SYMBOL.DEPLOYER._S.EXCHANGE_CTOR.WEB_SOCKET]() {
        return WebSocketExchange;
      }

      static withWebSocketExchange() {
        Ow.Error.Common('The deployer MUST NOT carry another WebSocket.');
      }
    };
  }
}

export { Http2HttpsDeployer as Http2Https };
