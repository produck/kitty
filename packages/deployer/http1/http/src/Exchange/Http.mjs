import { Readable } from 'node:stream';

import { Implement } from '@produck/kitty-workflow';

import * as RawRequest from '../RawRequest.mjs';
import * as ResponseBody from '../ResponseBody.mjs';
import * as Base from './Base.mjs';

export const options = Implement.Normalize.Exchange.Http({
  identity: Base.identity,
  server: Base.server,
  httpVersion: Base.httpVersion,
  request: {
    ...Base.request,
    body: {
      source: {
        get: ({ internal, self }) => {
          RawRequest.bind(self.exchange, internal.req, self);

          return internal.req;
        },
      },
    },
  },
  response: {
    ...Base.response,
    status: {
      get: Base.response.status.get,
      set: ({ internal }, value) => {
        internal.res.statusCode = value;
      },
    },
    statusText: {
      get: Base.response.statusText.get,
      set: ({ internal }, value) => {
        internal.res.statusMessage = value;
      },
    },
    header: {
      ...Base.response.header,
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

          ResponseBody.register(res);

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

export const Exchange = Implement.Exchange.Http(options);
