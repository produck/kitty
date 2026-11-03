import * as http from 'node:http';

import { instanceOf, Ow } from '@produck/argot';
import * as Workflow from '@produck/kitty-workflow';

import * as RawRequest from './RawRequest.mjs';

export * as Exchange from './Exchange/index.mjs';
export * as Deployer from './Deployer.mjs';

export function useServer(Kit) {
  const server = Workflow.useServer(Kit);

  if (!instanceOf(server, http.Server)) {
    Ow.Error.Common('The server on kit is NOT net.Server.');
  }

  return server;
}

export function useRawRequest(Kit) {
  const exchange = Workflow.useExchange(Kit);
  const entry = RawRequest.get(exchange);

  if (entry === undefined) {
    Ow.Error.Common('No raw request is bound to the exchange.');
  }

  entry.body.claimRaw();

  return entry.raw;
}
