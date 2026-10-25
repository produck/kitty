import { DeployerRegistry } from '@produck/kitty-workflow';

import Deployer from './Deployer.mjs';

export { default as Exchange } from './Exchange.mjs';
export { Deployer };

export function register() {
  DeployerRegistry.registerDeployer(Deployer);

  return Deployer;
}
