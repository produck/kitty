import { Ow } from '@produck/argot';
import { Implement, SYMBOL, useServer } from '@produck/kitty-workflow';

import * as Bridge from './Bridge.mjs';
import * as Exchange from './Exchange/index.mjs';
import { Http2Server } from './Intrinsic.mjs';

function isWebSocketConnect(headers) {
  return (
    headers[':method'] === 'CONNECT' && headers[':protocol'] === 'websocket'
  );
}

function enableConnectProtocol(session) {
  session.settings({ enableConnectProtocol: true });
}

export const options = Implement.Normalize.Deployer({
  tag: '2:http',
  server: Http2Server,
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

    async function streamListener(stream, headers) {
      const internal = { server, stream, headers };

      if (hasWebSocket && isWebSocketConnect(headers)) {
        return void (await handleWebSocketExchange(internal));
      }

      await handleHttpExchange(internal);

      const response = Bridge.getResponse(stream);

      if (response.responded || stream.writableEnded || stream.destroyed) {
        return;
      }

      response.responded = true;
      stream.respond({ ':status': response.status });
      stream.end();
    }

    declareToManifest('stream-listener', streamListener);

    if (hasWebSocket) {
      declareToManifest('session-listener', enableConnectProtocol);
    }

    setServerLinker((_context, next) => {
      server.on('stream', streamListener);

      if (hasWebSocket) {
        server.on('session', enableConnectProtocol);
      }

      return next();
    });
  },
});

export class Http2HttpDeployer extends Implement.Deployer(options) {
  static withWebSocketExchange(WebSocketExchange) {
    return class Http2WithWebSocketDeployer extends this {
      static get [SYMBOL.DEPLOYER._S.TAG]() {
        return '2:http,websocket';
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

export { Http2HttpDeployer as Http2Http };
