import { Ow } from '@produck/argot';

import { DEPLOYER } from './_Borrow.mjs';
import * as P from './_Parser.mjs';
import { I, $I } from './_Symbol.mjs';

export default class DeployerRegistry {
  [I.REGISTRY] = new Map();

  register(TargetDeployer) {
    P.SubDeployer(TargetDeployer);

    const Server = TargetDeployer[DEPLOYER._S.SERVER_CTOR];

    if (this[I.REGISTRY].has(Server)) {
      Ow.Error.Common(`Server constructor(${Server.name}) exists.`);
    }

    this[I.REGISTRY].set(Server, TargetDeployer);
  }

  [$I.RESOLVE](server) {
    for (const [Server, DeployerClass] of this[I.REGISTRY]) {
      if (server instanceof Server) {
        return DeployerClass;
      }
    }

    return undefined;
  }
}
