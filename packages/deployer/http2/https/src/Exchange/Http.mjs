import { Implement } from '@produck/kitty-workflow';
import * as Http1Http from '@produck/kitty-deployer-http1-http';
import * as Http2Http from '@produck/kitty-deployer-http2-http';

import * as Bridge from '../Bridge.mjs';
import * as Base from './Base.mjs';
import * as VersionRoute from './VersionRoute.mjs';

const ref = {
  h1: Http1Http.Exchange.Http.options,
  h2: Http2Http.Exchange.Http.options,
};

function bindSocket(readSocket, get) {
  return (context, ...args) => {
    const { self, internal } = context;

    Bridge.bindExchangeSocket(self.exchange, readSocket(internal));

    return get(context, ...args);
  };
}

export const options = Implement.Normalize.Exchange.Http({
  ...ref.h2,
  identity: Base.identity,
  server: Base.server,
  httpVersion: Base.httpVersion,
  local: Base.local,
  remote: Base.remote,
  request: {
    ...Base.request,
    body: {
      source: {
        get: VersionRoute.byContext({
          h1: bindSocket(
            ({ req }) => req.socket,
            ref.h1.request.body.source.get,
          ),
          h2: bindSocket(
            ({ stream }) => stream.session.socket,
            ref.h2.request.body.source.get,
          ),
        }),
      },
    },
  },
  response: {
    status: {
      get: VersionRoute.byContext({
        h1: ref.h1.response.status.get,
        h2: ref.h2.response.status.get,
      }),
      set: VersionRoute.byContext({
        h1: ref.h1.response.status.set,
        h2: ref.h2.response.status.set,
      }),
    },
    statusText: {
      get: VersionRoute.byContext({
        h1: ref.h1.response.statusText.get,
        h2: ref.h2.response.statusText.get,
      }),
      set: VersionRoute.byContext({
        h1: ref.h1.response.statusText.set,
        h2: ref.h2.response.statusText.set,
      }),
    },
    finished: {
      is: VersionRoute.byContext({
        h1: ref.h1.response.finished.is,
        h2: ref.h2.response.finished.is,
      }),
    },
    header: {
      get: VersionRoute.byContext({
        h1: ref.h1.response.header.get,
        h2: ref.h2.response.header.get,
      }),
      keys: VersionRoute.byContext({
        h1: ref.h1.response.header.keys,
        h2: ref.h2.response.header.keys,
      }),
      set: VersionRoute.byContext({
        h1: ref.h1.response.header.set,
        h2: ref.h2.response.header.set,
      }),
      append: VersionRoute.byContext({
        h1: ref.h1.response.header.append,
        h2: ref.h2.response.header.append,
      }),
      delete: VersionRoute.byContext({
        h1: ref.h1.response.header.delete,
        h2: ref.h2.response.header.delete,
      }),
    },
    body: {
      data: {
        set: VersionRoute.byContext({
          h1: function writeHttp1Body(context, payload) {
            Bridge.markWritten(context.internal.res);
            ref.h1.response.body.data.set(context, payload);
          },
          h2: ref.h2.response.body.data.set,
        }),
      },
    },
  },
});

export const Exchange = Implement.Exchange.Http(options);
