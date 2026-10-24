import * as net from 'node:net';

import { SubConstructorProxy as SCP } from '@produck/es-abstract';

import { Abstract, DeployerRegistry, SYMBOL } from '@produck/kitty-workflow';

import HttpExchange from './HttpExchange.mjs';

export function createDeployer(options = {}) {
  const {
    name = 'baseline',
    declare = null,
    linkers = [],
    install = null,
  } = options;

  class Server extends net.Server {}

  const linkLog = [];
  const installLog = [];

  const Deployer = SCP(
    class extends Abstract.Deployer {
      static get name() {
        return name;
      }

      static get [SYMBOL.DEPLOYER._S.NAME]() {
        return name;
      }

      static get [SYMBOL.DEPLOYER._S.SERVER_CTOR]() {
        return Server;
      }

      static get [SYMBOL.DEPLOYER._S.EXCHANGE_CTOR.HTTP]() {
        return HttpExchange;
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
