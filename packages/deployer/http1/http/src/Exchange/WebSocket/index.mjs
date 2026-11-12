import { STATUS_CODES } from 'node:http';

import { Implement } from '@produck/kitty-workflow';

import * as Bridge from './Bridge.mjs';
import * as Base from '../Base.mjs';

export const options = Implement.Normalize.Exchange.WebSocket({
  identity: Base.identity,
  server: Base.server,
  httpVersion: Base.httpVersion,
  local: Base.local,
  remote: Base.remote,
  request: Base.request,
  controller: {
    handleUpgrade: ({ internal, self, notifier }) => {
      const server = Bridge.getWebSocketServer(internal.server);
      const { req, socket, head } = internal;

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

      server.handleUpgrade(req, socket, head, callback);
    },
    rejectUpgrade: ({ internal }, status, reason) => {
      const { socket } = internal;

      const lines = [
        `HTTP/1.1 ${status} ${STATUS_CODES[status]}`,
        'Connection: close',
        'Content-Type: text/html',
        `Content-Length: ${Buffer.byteLength(reason)}`,
        '',
        reason,
      ];

      socket.once('finish', () => socket.destroy());
      socket.end(lines.join('\r\n'));
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
