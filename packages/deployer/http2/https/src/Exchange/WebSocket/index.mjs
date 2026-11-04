import { Implement } from '@produck/kitty-workflow';
import * as Http1WebSocket from '@produck/kitty-deployer-http1-http/exchange/websocket';
import * as Http2WebSocket from '@produck/kitty-deployer-http2-http/exchange/websocket';

import * as VersionRoute from '../VersionRoute.mjs';

const ref = {
  h1: Http1WebSocket.options,
  h2: Http2WebSocket.options,
};

export const options = Implement.Normalize.Exchange.WebSocket({
  ...ref.h2,
  server: {
    get: ref.h2.server.get,
    protocol: {
      get: () => 'https:',
    },
  },
  identity: {
    get: VersionRoute.byInternal({
      h1: ref.h1.identity.get,
      h2: ref.h2.identity.get,
    }),
  },
  httpVersion: {
    get: VersionRoute.byContext({
      h1: ref.h1.httpVersion.get,
      h2: ref.h2.httpVersion.get,
    }),
  },
  request: {
    method: {
      get: VersionRoute.byContext({
        h1: ref.h1.request.method.get,
        h2: ref.h2.request.method.get,
      }),
    },
    URL: {
      get: VersionRoute.byContext({
        h1: ref.h1.request.URL.get,
        h2: ref.h2.request.URL.get,
      }),
    },
    header: {
      get: VersionRoute.byContext({
        h1: ref.h1.request.header.get,
        h2: ref.h2.request.header.get,
      }),
      keys: VersionRoute.byContext({
        h1: ref.h1.request.header.keys,
        h2: ref.h2.request.header.keys,
      }),
    },
  },
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
