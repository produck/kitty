import { Implement } from '@produck/kitty-workflow';
import * as Http1WebSocket from '@produck/kitty-deployer-http1-http/exchange/websocket';
import * as Http2WebSocket from '@produck/kitty-deployer-http2-http/exchange/websocket';

import * as Base from '../Base.mjs';
import * as VersionRoute from '../VersionRoute.mjs';

const ref = {
  h1: Http1WebSocket.options,
  h2: Http2WebSocket.options,
};

export const options = Implement.Normalize.Exchange.WebSocket({
  ...ref.h2,
  identity: Base.identity,
  server: Base.server,
  httpVersion: Base.httpVersion,
  request: Base.request,
  controller: {
    handleUpgrade: VersionRoute.byContext({
      h1: ref.h1.controller.handleUpgrade,
      h2: ref.h2.controller.handleUpgrade,
    }),
    rejectUpgrade: VersionRoute.byContext({
      h1: ref.h1.controller.rejectUpgrade,
      h2: ref.h2.controller.rejectUpgrade,
    }),
    readyState: {
      get: VersionRoute.byContext({
        h1: ref.h1.controller.readyState.get,
        h2: ref.h2.controller.readyState.get,
      }),
    },
    send: {
      send: VersionRoute.byContext({
        h1: ref.h1.controller.send.send,
        h2: ref.h2.controller.send.send,
      }),
    },
    close: {
      close: VersionRoute.byContext({
        h1: ref.h1.controller.close.close,
        h2: ref.h2.controller.close.close,
      }),
    },
  },
});

export const Exchange = Implement.Exchange.WebSocket(options);
