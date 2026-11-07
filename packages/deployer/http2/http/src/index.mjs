import { instanceOf, Ow } from '@produck/argot';
import * as Workflow from '@produck/kitty-workflow';

import * as Bridge from './Bridge.mjs';
import * as Intrinsic from './Intrinsic.mjs';

export * as Exchange from './Exchange/index.mjs';
export * as Deployer from './Deployer.mjs';

export function useServer(Kit) {
  const server = Workflow.Use.Server(Kit);

  if (!instanceOf(server, Intrinsic.Http2Server)) {
    Ow.Error.Common('The server on kit is NOT http2.Http2Server.');
  }

  return server;
}

function findRawStream(Kit) {
  const exchange = Workflow.Use.Exchange(Kit);
  const entry = Bridge.getRaw(exchange);

  if (entry === undefined) {
    Ow.Error.Common('No raw stream is bound to the exchange.');
  }

  return entry;
}

export function useHttp2Stream(Kit) {
  const entry = findRawStream(Kit);

  entry.body.claimRaw();

  return entry.stream;
}

export function inspectHttp2Stream(Kit) {
  return findRawStream(Kit).stream;
}
