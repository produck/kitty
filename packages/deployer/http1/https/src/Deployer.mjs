import * as https from 'node:https';

import { Implement, SYMBOL } from '@produck/kitty-workflow';
import * as Http1Http from '@produck/kitty-deployer-http1-http';

export const options = Implement.Normalize.Deployer({
  ...Http1Http.Deployer.options,
  tag: '1:https',
  server: https.Server,
});

export class Http1HttpsDeployer extends Implement.Deployer(options) {
  static withWebSocketExchange(WebSocketExchange) {
    return class Http1HttpsWithWebSocketDeployer extends this {
      static get [SYMBOL.DEPLOYER._S.TAG]() {
        return '1:https,websocket';
      }

      static get [SYMBOL.DEPLOYER._S.EXCHANGE_CTOR.WEB_SOCKET]() {
        return WebSocketExchange;
      }
    };
  }
}
