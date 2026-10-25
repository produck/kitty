import { SubConstructorProxy as SCP } from '@produck/es-abstract';

import { Abstract as DeployerAbstract } from '../../CompoundWorkflow/Deployer/index.mjs';
import * as DEPLOYER from '../../CompoundWorkflow/Deployer/_Symbol.mjs';
import Normalize from './Normalize.mjs';

export function Deployer(_options) {
  const { tag, server, exchange, install } = Normalize(_options);

  class ImplDeployer extends DeployerAbstract {
    static get [DEPLOYER._S.TAG]() {
      return tag;
    }

    static get [DEPLOYER._S.SERVER_CTOR]() {
      return server;
    }

    static get [DEPLOYER._S.EXCHANGE_CTOR.HTTP]() {
      return exchange.http;
    }

    static get [DEPLOYER._S.EXCHANGE_CTOR.WEB_SOCKET]() {
      return exchange.webSocket;
    }

    [DEPLOYER._I.INSTALL](kit) {
      install(kit);
    }
  }

  return SCP(ImplDeployer);
}
