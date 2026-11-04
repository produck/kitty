import { instanceOf, Ow } from '@produck/argot';
import * as Workflow from '@produck/kitty-workflow';

import { Http2SecureServer } from './Intrinsic.mjs';

export * as Exchange from './Exchange/index.mjs';
export * as Deployer from './Deployer.mjs';

export function useServer(Kit) {
  const server = Workflow.useServer(Kit);

  if (!instanceOf(server, Http2SecureServer)) {
    Ow.Error.Common('The server on kit is NOT http2.Http2SecureServer.');
  }

  return server;
}
