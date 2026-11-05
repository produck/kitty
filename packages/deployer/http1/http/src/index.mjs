import * as http from 'node:http';

import { instanceOf, Ow } from '@produck/argot';
import * as Workflow from '@produck/kitty-workflow';

import * as Bridge from './Bridge.mjs';

export * as Exchange from './Exchange/index.mjs';
export * as Deployer from './Deployer.mjs';

export function useServer(Kit) {
  const server = Workflow.useServer(Kit);

  if (!instanceOf(server, http.Server)) {
    Ow.Error.Common('The server on kit is NOT net.Server.');
  }

  return server;
}

function findRawRequest(Kit) {
  const exchange = Workflow.useExchange(Kit);
  const entry = Bridge.getRaw(exchange);

  if (entry === undefined) {
    Ow.Error.Common('No raw request is bound to the exchange.');
  }

  return entry;
}

export function useHttp1Request(Kit) {
  const entry = findRawRequest(Kit);

  entry.body.claimRaw();

  return entry.raw;
}

export function inspectHttp1Request(Kit) {
  return findRawRequest(Kit).raw;
}
