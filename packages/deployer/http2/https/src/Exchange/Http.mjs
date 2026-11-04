import { Readable } from 'node:stream';

import { Implement } from '@produck/kitty-workflow';

import * as Bridge from '../Bridge.mjs';
import * as VersionRoute from './VersionRoute.mjs';
import * as Base from './Base.mjs';

export const options = Implement.Normalize.Exchange.Http({
  identity: Base.identity,
  server: Base.server,
  httpVersion: Base.httpVersion,
  request: {
    ...Base.request,
    body: {
      source: {
        get: VersionRoute.byContext({
          h1: function readHttp1BodySource({ internal }) {
            return internal.req;
          },
          h2: function readHttp2BodySource({ internal }) {
            return Readable.from(internal.stream, { objectMode: false });
          },
        }),
      },
    },
  },
  response: {
    ...Base.response,
    status: {
      get: Base.response.status.get,
      set: VersionRoute.byContext({
        h1: function setHttp1Status({ internal }, value) {
          internal.res.statusCode = value;
        },
        h2: function setHttp2Status({ internal }, value) {
          Bridge.getResponse(internal.stream).status = value;
        },
      }),
    },
    statusText: {
      get: Base.response.statusText.get,
      set: VersionRoute.byContext({
        h1: function setHttp1StatusText({ internal }, value) {
          internal.res.statusMessage = value;
        },
        h2: function setHttp2StatusText({ internal }, value) {
          Bridge.getResponse(internal.stream).statusText = value;
        },
      }),
    },
    header: {
      ...Base.response.header,
      set: VersionRoute.byContext({
        h1: function setHttp1Header({ internal }, key, value) {
          internal.res.setHeader(key, value);
        },
        h2: function setHttp2Header({ internal }, key, value) {
          Bridge.getResponse(internal.stream).headers.set(
            key.toLowerCase(),
            value,
          );
        },
      }),
      delete: VersionRoute.byContext({
        h1: function deleteHttp1Header({ internal }, key) {
          internal.res.removeHeader(key);
        },
        h2: function deleteHttp2Header({ internal }, key) {
          Bridge.getResponse(internal.stream).headers.delete(key.toLowerCase());
        },
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
          h2: function writeHttp2Body({ internal }, { stream: body, length }) {
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
        }),
      },
    },
  },
});

export const Exchange = Implement.Exchange.Http(options);
