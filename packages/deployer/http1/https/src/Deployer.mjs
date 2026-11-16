import * as https from 'node:https';

import { Ow } from '@produck/argot';
import { Implement, SYMBOL } from '@produck/kitty-workflow';
import * as Http1Http from '@produck/kitty-deployer-http1-http';

import * as Exchange from './Exchange/Http.mjs';

export const options = Implement.Normalize.Deployer({
  ...Http1Http.Deployer.options,
  tag: '1:https',
  server: https.Server,
  exchange: { http: Exchange.Exchange },
});

export class Http1HttpsDeployer extends Implement.Deployer(options) {
  static deriveWithWebSocketExchange(WebSocketExchange) {
    return class Http1HttpsWebSocketExchangeDeployer extends this {
      static get [SYMBOL.DEPLOYER._S.TAG]() {
        return '1:https,websocket';
      }

      static get [SYMBOL.DEPLOYER._S.EXCHANGE_CTOR.WEB_SOCKET]() {
        return WebSocketExchange;
      }

      static deriveWithWebSocketExchange() {
        Ow.Error.Common('The deployer MUST NOT carry another WebSocket.');
      }
    };
  }
}
