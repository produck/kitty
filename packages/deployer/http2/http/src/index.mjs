import { instanceOf, Ow } from '@produck/argot';
import * as Workflow from '@produck/kitty-workflow';

import * as Bridge from './Bridge.mjs';
import { Http2Server } from './Intrinsic.mjs';

export * as Exchange from './Exchange/index.mjs';
export * as Deployer from './Deployer.mjs';

export function useServer(Kit) {
  const server = Workflow.useServer(Kit);

  if (!instanceOf(server, Http2Server)) {
    Ow.Error.Common('The server on kit is NOT http2.Http2Server.');
  }

  return server;
}

export function useRawStream(Kit) {
  const exchange = Workflow.useExchange(Kit);
  const entry = Bridge.getRaw(exchange);

  if (entry === undefined) {
    Ow.Error.Common('No raw stream is bound to the exchange.');
  }

  entry.body.claimRaw();

  return entry.stream;
}
