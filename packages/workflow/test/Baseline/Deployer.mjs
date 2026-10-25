import * as net from 'node:net';

import { SubConstructorProxy as SCP } from '@produck/es-abstract';

import { Abstract, DeployerRegistry, SYMBOL } from '@produck/kitty-workflow';

import HttpExchange from './HttpExchange.mjs';
import WebSocketExchange from './WebSocketExchange.mjs';

export function createDeployer(options = {}) {
  const {
    tag = 'baseline',
    declare = null,
    linkers = [],
    install = null,
    webSocket = false,
  } = options;

  class Server extends net.Server {}

  const linkLog = [];
  const installLog = [];

  const Deployer = SCP(
    class extends Abstract.Deployer {
      static get [SYMBOL.DEPLOYER._S.TAG]() {
        return tag;
      }

      static get [SYMBOL.DEPLOYER._S.SERVER_CTOR]() {
        return Server;
      }

      static get [SYMBOL.DEPLOYER._S.EXCHANGE_CTOR.HTTP]() {
        return HttpExchange;
      }

      static get [SYMBOL.DEPLOYER._S.EXCHANGE_CTOR.WEB_SOCKET]() {
        return webSocket ? WebSocketExchange : undefined;
      }

      [SYMBOL.DEPLOYER._I.INSTALL](kit) {
        installLog.push(kit);

        if (declare !== null) {
          declare(kit);
        }

        for (const label of linkers) {
          kit.setServerLinker((_ctx, next) => {
            linkLog.push(label);

            return next();
          });
        }

        if (install !== null) {
          install(kit);
        }
      }
    },
  );

  DeployerRegistry.registerDeployer(Deployer);

  return {
    Deployer,
    HttpExchange,
    Server,
    installLog,
    linkLog,
  };
}
