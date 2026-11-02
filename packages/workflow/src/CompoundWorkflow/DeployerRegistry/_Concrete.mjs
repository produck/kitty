import { instanceOf, Ow } from '@produck/argot';

import { DEPLOYER } from './_Borrow.mjs';
import * as P from './_Parser.mjs';
import { I, $I } from './_Symbol.mjs';

export default class DeployerRegistry {
  [I.REGISTRY] = new Map();
  [I.INSTANCE_MAP] = new WeakMap();

  register(TargetDeployer) {
    P.SubDeployer(TargetDeployer);

    const Server = TargetDeployer[DEPLOYER._S.SERVER_CTOR];

    if (this[I.REGISTRY].has(Server)) {
      Ow.Error.Common(`Server constructor(${Server.name}) exists.`);
    }

    this[I.REGISTRY].set(Server, TargetDeployer);
  }

  isAvaiableServer(value) {
    for (const constructor of this[I.REGISTRY].keys()) {
      if (instanceOf(value, constructor)) {
        return true;
      }
    }

    return false;
  }

  [$I.RESOLVE](server) {
    const fromInstance = this[I.INSTANCE_MAP].get(server);

    if (fromInstance !== undefined) {
      return fromInstance;
    }

    const ServerConstructor = Object.getPrototypeOf(server).constructor;

    return this[I.REGISTRY].get(ServerConstructor);
  }

  [$I.ASSOCIATE](server, DeployerClass) {
    this[I.INSTANCE_MAP].set(server, DeployerClass);
  }
}
