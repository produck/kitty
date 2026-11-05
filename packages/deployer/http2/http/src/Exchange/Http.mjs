import { Readable } from 'node:stream';

import { noop } from '@produck/argot';
import { Implement } from '@produck/kitty-workflow';

import * as Bridge from '../Bridge.mjs';
import * as Base from './Base.mjs';

export const options = Implement.Normalize.Exchange.Http({
  identity: Base.identity,
  server: Base.server,
  httpVersion: Base.httpVersion,
  request: {
    ...Base.request,
    body: {
      source: {
        get: (context) => {
          const { internal, self } = context;

          Bridge.bindRaw(self.exchange, internal.stream, self);

          return Readable.from(internal.stream, { objectMode: false });
        },
      },
    },
  },
  response: {
    ...Base.response,
    status: {
      get: Base.response.status.get,
      set: ({ internal }, value) => {
        Bridge.getResponse(internal.stream).status = value;
      },
    },
    statusText: {
      get: Base.response.statusText.get,
      set: noop,
    },
    header: {
      ...Base.response.header,
      set: ({ internal }, key, value) => {
        Bridge.getResponse(internal.stream).headers.set(
          key.toLowerCase(),
          value,
        );
      },
      append: ({ internal }, key, value) => {
        const { headers } = Bridge.getResponse(internal.stream);
        const name = key.toLowerCase();
        const current = headers.get(name);

        if (current === undefined) {
          headers.set(name, value);
        } else if (Array.isArray(current)) {
          current.push(value);
        } else {
          headers.set(name, [current, value]);
        }
      },
      delete: ({ internal }, key) => {
        Bridge.getResponse(internal.stream).headers.delete(key.toLowerCase());
      },
    },
    body: {
      data: {
        set: function writeBody({ internal }, { stream: body, length }) {
          const { stream } = internal;
          const response = Bridge.getResponse(stream);
          const headers = { ':status': response.status };

          for (const [key, value] of response.headers) {
            headers[key] = value;
          }

          if (length !== null) {
            headers['content-length'] = length;
          }

          response.responded = true;
          stream.respond(headers);

          if (body === null) {
            return void stream.end();
          }

          Readable.fromWeb(body).pipe(stream);
        },
      },
    },
  },
});

export const Exchange = Implement.Exchange.Http(options);
