import { Readable } from 'node:stream';

import { Implement } from '@produck/kitty-workflow';
import * as Http2Http from '@produck/kitty-deployer-http2-http';

import * as Bridge from '../Bridge.mjs';
import * as VersionRoute from './VersionRoute.mjs';

const http2 = Http2Http.Exchange.Http.options;

function toHeaderValue(value) {
  if (value === undefined) {
    return undefined;
  }

  return Array.isArray(value) ? value.join(', ') : String(value);
}

export const options = Implement.Normalize.Exchange.Http({
  ...http2,
  server: {
    ...http2.server,
    protocol: {
      get: () => 'https:',
    },
  },
  identity: {
    get: VersionRoute.byInternal({
      h1: function readHttp1Identity(internal) {
        return internal.req;
      },
      h2: http2.identity.get,
    }),
  },
  httpVersion: {
    get: VersionRoute.byContext({
      h1: function getHttp1Version({ internal }) {
        return internal.req.httpVersion;
      },
      h2: http2.httpVersion.get,
    }),
  },
  request: {
    ...http2.request,
    method: {
      get: VersionRoute.byContext({
        h1: function getHttp1Method({ internal }) {
          return internal.req.method;
        },
        h2: http2.request.method.get,
      }),
    },
    URL: {
      get: VersionRoute.byContext({
        h1: function getHttp1URL({ internal }) {
          return internal.req.url;
        },
        h2: http2.request.URL.get,
      }),
    },
    header: {
      get: VersionRoute.byContext({
        h1: function getHttp1Header({ internal }, key) {
          return toHeaderValue(internal.req.headers[key]);
        },
        h2: http2.request.header.get,
      }),
      keys: VersionRoute.byContext({
        h1: function* requestHeaderKeysHttp1({ internal }) {
          yield* Object.keys(internal.req.headers);
        },
        h2: http2.request.header.keys,
      }),
    },
    body: {
      source: {
        get: VersionRoute.byContext({
          h1: function readHttp1BodySource({ internal }) {
            return internal.req;
          },
          h2: http2.request.body.source.get,
        }),
      },
    },
  },
  response: {
    ...http2.response,
    status: {
      get: VersionRoute.byContext({
        h1: function getHttp1Status({ internal }) {
          return internal.res.statusCode;
        },
        h2: http2.response.status.get,
      }),
      set: VersionRoute.byContext({
        h1: function setHttp1Status({ internal }, value) {
          internal.res.statusCode = value;
        },
        h2: http2.response.status.set,
      }),
    },
    statusText: {
      get: VersionRoute.byContext({
        h1: function getHttp1StatusText({ internal }) {
          return internal.res.statusMessage ?? '';
        },
        h2: http2.response.statusText.get,
      }),
      set: VersionRoute.byContext({
        h1: function setHttp1StatusText({ internal }, value) {
          internal.res.statusMessage = value;
        },
        h2: http2.response.statusText.set,
      }),
    },
    finished: {
      is: VersionRoute.byContext({
        h1: function isHttp1Finished({ internal }) {
          return internal.res.writableEnded;
        },
        h2: http2.response.finished.is,
      }),
    },
    header: {
      get: VersionRoute.byContext({
        h1: function getHttp1ResponseHeader({ internal }, key) {
          return toHeaderValue(internal.res.getHeader(key));
        },
        h2: http2.response.header.get,
      }),
      keys: VersionRoute.byContext({
        h1: function* responseHeaderKeysHttp1({ internal }) {
          yield* internal.res.getHeaderNames();
        },
        h2: http2.response.header.keys,
      }),
      set: VersionRoute.byContext({
        h1: function setHttp1Header({ internal }, key, value) {
          internal.res.setHeader(key, value);
        },
        h2: http2.response.header.set,
      }),
      delete: VersionRoute.byContext({
        h1: function deleteHttp1Header({ internal }, key) {
          internal.res.removeHeader(key);
        },
        h2: http2.response.header.delete,
      }),
    },
    body: {
      data: {
        set: VersionRoute.byContext({
          h1: function writeHttp1Body({ internal }, { stream: body, length }) {
            const { res } = internal;

            Bridge.markWritten(res);

            if (length !== null) {
              res.setHeader('content-length', length);
            }

            if (body === null) {
              return void res.end();
            }

            Readable.fromWeb(body).pipe(res);
          },
          h2: http2.response.body.data.set,
        }),
      },
    },
  },
});

export const Exchange = Implement.Exchange.Http(options);
