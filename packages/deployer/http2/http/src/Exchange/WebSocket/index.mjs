import { Implement } from '@produck/kitty-workflow';

import * as Bridge from './Bridge.mjs';
import * as Base from '../Base.mjs';

export const options = Implement.Normalize.Exchange.WebSocket({
  identity: Base.identity,
  server: Base.server,
  httpVersion: Base.httpVersion,
  request: Base.request,
  controller: {
    handleUpgrade: ({ internal, self, notifier }) => {
      const server = Bridge.getWebSocketServer(internal.server);
      const { stream, headers } = internal;

      function callback(ws) {
        Bridge.bindWebSocket(self, ws);

        ws.on('message', (data, isBinary) => {
          notifier.message(isBinary ? data : data.toString(), isBinary);
        });

        ws.on('close', (code, reason) => {
          notifier.close(code, reason.toString());
        });

        ws.on('error', (error) => {
          notifier.error(error);
        });
      }

      server.handleConnect(stream, headers, callback);
    },
    rejectUpgrade: ({ internal }, status, reason) => {
      const { stream } = internal;
      const length = Buffer.byteLength(reason);

      stream.respond({
        ':status': status,
        'content-type': 'text/plain',
        'content-length': length,
      });

      stream.end(reason);
    },
    readyState: {
      get: ({ self }) => Bridge.getWebSocket(self).readyState,
    },
    send: {
      send: ({ self }, data) => {
        Bridge.getWebSocket(self).send(data);
      },
    },
    close: {
      close: ({ self }, code, reason) => {
        Bridge.getWebSocket(self).close(code, reason);
      },
    },
  },
});

export const Exchange = Implement.Exchange.WebSocket(options);
