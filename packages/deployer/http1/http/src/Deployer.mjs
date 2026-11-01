import * as http from 'node:http';

import { Implement, SYMBOL, useServer } from '@produck/kitty-workflow';

import * as Exchange from './Exchange/index.mjs';
import * as ResponseBody from './ResponseBody.mjs';

export const options = Implement.Normalize.Deployer({
  tag: '1:http',
  server: http.Server,
  exchange: { http: Exchange.Http.Exchange },
  install({
    Kit,
    handleHttpExchange,
    handleWebSocketExchange,
    declareToManifest,
    setServerLinker,
    hasWebSocketExchange,
  }) {
    const server = useServer(Kit);

    async function requestListener(req, res) {
      await handleHttpExchange({ server, req, res });

      if (!ResponseBody.isRegistered(res) && !res.writableEnded) {
        res.end();
      }
    }

    async function upgradeListener(req, socket, head) {
      await handleWebSocketExchange({ server, req, res: null, socket, head });
    }

    declareToManifest('request-listener', requestListener);

    const hasWebSocket = hasWebSocketExchange();

    if (hasWebSocket) {
      declareToManifest('upgrade-listener', upgradeListener);
    }

    setServerLinker((_context, next) => {
      server.on('request', requestListener);

      if (hasWebSocket) {
        server.on('upgrade', upgradeListener);
      }

      return next();
    });
  },
});

export class Http1HttpDeployer extends Implement.Deployer(options) {
  static withWebSocketExchange(WebSocketExchange) {
    return class Http1WithWebSocketDeployer extends this {
      static get [SYMBOL.DEPLOYER._S.TAG]() {
        return '1:http,websocket';
      }

      static get [SYMBOL.DEPLOYER._S.EXCHANGE_CTOR.WEB_SOCKET]() {
        return WebSocketExchange;
      }
    };
  }
}

export { Http1HttpDeployer as Http1Http };
