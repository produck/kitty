import { Readable } from 'node:stream';

import { Implement } from '@produck/kitty-workflow';

import { markWritten } from './_patch.mjs';

const PROTOCOL = 'http:';

function toHeaderValue(value) {
  return value === undefined ? undefined : String(value);
}

export default Implement.Exchange.Http({
  identity: {
    get: (internal) => internal.req,
  },
  server: {
    get: ({ internal }) => internal.server,
    protocol: {
      get: () => PROTOCOL,
    },
  },
  httpVersion: {
    get: ({ internal }) => internal.req.httpVersion,
  },
  request: {
    method: {
      get: ({ internal }) => internal.req.method,
    },
    URL: {
      get: ({ internal }) => internal.req.url,
    },
    header: {
      get: ({ internal }, key) => {
        return toHeaderValue(internal.req.headers[key.toLowerCase()]);
      },
      keys: ({ internal }) => Object.keys(internal.req.headers),
    },
    body: {
      source: {
        get: ({ internal }) => internal.req,
      },
    },
  },
  response: {
    status: {
      get: ({ internal }) => internal.res.statusCode,
      set: ({ internal }, value) => {
        internal.res.statusCode = value;
      },
    },
    statusText: {
      get: ({ internal }) => internal.res.statusMessage,
      set: ({ internal }, value) => {
        internal.res.statusMessage = value;
      },
    },
    finished: {
      is: ({ internal }) => internal.res.writableEnded,
    },
    header: {
      get: ({ internal }, key) => {
        return toHeaderValue(internal.res.getHeader(key));
      },
      keys: ({ internal }) => internal.res.getHeaderNames(),
      set: ({ internal }, key, value) => {
        internal.res.setHeader(key, value);
      },
      delete: ({ internal }, key) => {
        internal.res.removeHeader(key);
      },
    },
    body: {
      data: {
        set: function writeBody({ internal }, { stream, length }) {
          const { res } = internal;

          markWritten(res);

          if (length !== null) {
            res.setHeader('content-length', length);
          }

          if (stream === null) {
            return void res.end();
          }

          Readable.fromWeb(stream).pipe(res);
        },
      },
    },
  },
});
