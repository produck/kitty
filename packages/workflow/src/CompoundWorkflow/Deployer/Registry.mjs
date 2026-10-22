import { Ow } from '@produck/argot';
import { SubConstructorOf as M_Sub } from '@produck/es-abstract-member-constructor';

import Deployer from './_Abstract.mjs';
import { _S } from './_Symbol.mjs';

const registry = new Map();
const instanceMap = new WeakMap();

const assertDeployer = M_Sub(Deployer);

function registerDeployer(DeployerClass) {
  assertDeployer(DeployerClass);

  const Server = DeployerClass[_S.SERVER_CTOR];

  if (registry.has(Server)) {
    Ow.Error.Common(`Server constructor(${Server.name}) exists.`);
  }

  registry.set(Server, DeployerClass);
}

export function isAvaiableServer(value) {
  for (const constructor of registry.keys()) {
    if (value instanceof constructor) {
      return true;
    }
  }

  return false;
}

export function getByServer(server) {
  const fromInstance = instanceMap.get(server);

  if (fromInstance !== undefined) {
    return fromInstance;
  }

  const ServerConstructor = Object.getPrototypeOf(server).constructor;

  return registry.get(ServerConstructor);
}

export function associate(server, DeployerClass) {
  instanceMap.set(server, DeployerClass);
}

export { assertDeployer, registerDeployer };
