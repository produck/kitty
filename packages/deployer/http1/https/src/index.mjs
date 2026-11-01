import * as https from 'node:https';

import { instanceOf, Ow } from '@produck/argot';
import * as Workflow from '@produck/kitty-workflow';

export { Exchange } from '@produck/kitty-deployer-http1-http';
export * as Deployer from './Deployer.mjs';

export function useServer(...args) {
  const server = Workflow.useServer(...args);

  if (!instanceOf(server, https.Server)) {
    Ow.Error.Common('The server on kit is NOT https.Server.');
  }

  return server;
}
