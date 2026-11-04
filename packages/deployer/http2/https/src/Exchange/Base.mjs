import * as Bridge from '../Bridge.mjs';
import * as VersionRoute from './VersionRoute.mjs';

export function toHeaderValue(value) {
  if (value === undefined) {
    return undefined;
  }

  return Array.isArray(value) ? value.join(', ') : String(value);
}

export const identity = {
  get: VersionRoute.byInternal({
    h1: function readHttp1Identity(internal) {
      return internal.req;
    },
    h2: function readHttp2Identity(internal) {
      return internal.stream;
    },
  }),
};

export const server = {
  get: ({ internal }) => internal.server,
  protocol: {
    get: () => 'https:',
  },
};

export const httpVersion = {
  get: VersionRoute.byContext({
    h1: function getHttp1Version({ internal }) {
      return internal.req.httpVersion;
    },
    h2: function getHttp2Version() {
      return '2.0';
    },
  }),
};

export const request = {
  method: {
    get: VersionRoute.byContext({
      h1: function getHttp1Method({ internal }) {
        return internal.req.method;
      },
      h2: function getHttp2Method({ internal }) {
        return internal.headers[':method'];
      },
    }),
  },
  URL: {
    get: VersionRoute.byContext({
      h1: function getHttp1URL({ internal }) {
        return internal.req.url;
      },
      h2: function getHttp2URL({ internal }) {
        return internal.headers[':path'];
      },
    }),
  },
  header: {
    get: VersionRoute.byContext({
      h1: function getHttp1Header({ internal }, key) {
        return toHeaderValue(internal.req.headers[key]);
      },
      h2: function getHttp2Header({ internal }, key) {
        const { headers } = internal;

        if (headers[key] !== undefined) {
          return toHeaderValue(headers[key]);
        }

        return key === 'host'
          ? toHeaderValue(headers[':authority'])
          : undefined;
      },
    }),
    keys: VersionRoute.byContext({
      h1: function* requestHeaderKeysHttp1({ internal }) {
        yield* Object.keys(internal.req.headers);
      },
      h2: function* requestHeaderKeysHttp2({ internal }) {
        for (const key in internal.headers) {
          if (!key.startsWith(':')) {
            yield key;
          }
        }
      },
    }),
  },
};

export const response = {
  status: {
    get: VersionRoute.byContext({
      h1: function getHttp1Status({ internal }) {
        return internal.res.statusCode;
      },
      h2: function getHttp2Status({ internal }) {
        return Bridge.getResponse(internal.stream).status;
      },
    }),
  },
  statusText: {
    get: VersionRoute.byContext({
      h1: function getHttp1StatusText({ internal }) {
        return internal.res.statusMessage ?? '';
      },
      h2: function getHttp2StatusText({ internal }) {
        return Bridge.getResponse(internal.stream).statusText;
      },
    }),
  },
  finished: {
    is: VersionRoute.byContext({
      h1: function isHttp1Finished({ internal }) {
        return internal.res.writableEnded;
      },
      h2: function isHttp2Finished({ internal }) {
        return internal.stream.writableEnded;
      },
    }),
  },
  header: {
    get: VersionRoute.byContext({
      h1: function getHttp1ResponseHeader({ internal }, key) {
        return toHeaderValue(internal.res.getHeader(key));
      },
      h2: function getHttp2ResponseHeader({ internal }, key) {
        return Bridge.getResponse(internal.stream).headers.get(key);
      },
    }),
    keys: VersionRoute.byContext({
      h1: function* responseHeaderKeysHttp1({ internal }) {
        yield* internal.res.getHeaderNames();
      },
      h2: function* responseHeaderKeysHttp2({ internal }) {
        yield* Bridge.getResponse(internal.stream).headers.keys();
      },
    }),
  },
};
