import * as http from 'node:http';

import { instanceOf, Ow } from '@produck/argot';
import * as Workflow from '@produck/kitty-workflow';

export * as Exchange from './Exchange/index.mjs';
export * as Deployer from './Deployer.mjs';

export function useServer(...args) {
  const server = Workflow.useServer(...args);

  if (!instanceOf(server, http.Server)) {
    Ow.Error.Common('The server on kit is NOT net.Server.');
  }

  return server;
}
