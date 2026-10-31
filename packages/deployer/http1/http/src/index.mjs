import * as http from 'node:http';

import { instanceOf, Ow } from '@produck/argot';
import * as Workflow from '@produck/kitty-workflow';

import Deployer from './Deployer.mjs';

export { default as Exchange } from './Exchange.mjs';
export { Deployer };

export function register() {
  Workflow.DeployerRegistry.registerDeployer(Deployer);

  return Deployer;
}

export function useServer(...args) {
  const server = Workflow.useServer(...args);

  if (!instanceOf(server, http.Server)) {
    Ow.Error.Common('The server on kit is NOT net.Server.');
  }

  return server;
}
