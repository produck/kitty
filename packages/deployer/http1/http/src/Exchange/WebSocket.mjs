import { STATUS_CODES } from 'node:http';

import { WebSocketServer } from 'ws';

import { Implement } from '@produck/kitty-workflow';

import * as Base from './Base.mjs';

const SERVER_MAP = new WeakMap();
const WEB_SOCKET_MAP = new WeakMap();

function getWebSocketServer(server) {
  if (SERVER_MAP.get(server) === undefined) {
    SERVER_MAP.set(server, new WebSocketServer({ noServer: true }));
  }

  return SERVER_MAP.get(server);
}

export const options = Implement.Normalize.Exchange.WebSocket({
  identity: Base.identity,
  server: Base.server,
  httpVersion: Base.httpVersion,
  request: Base.request,
  controller: {
    handleUpgrade: ({ internal, self, notifier }) => {
      getWebSocketServer(internal.server).handleUpgrade(
        internal.req,
        internal.socket,
        internal.head,
        (ws) => {
          WEB_SOCKET_MAP.set(self, ws);

          ws.on('message', (data, isBinary) => {
            notifier.message(isBinary ? data : data.toString(), isBinary);
          });

          ws.on('close', (code, reason) => {
            notifier.close(code, reason.toString());
          });

          ws.on('error', (error) => {
            notifier.error(error);
          });
        },
      );
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
      get: ({ self }) => WEB_SOCKET_MAP.get(self).readyState,
    },
    send: {
      send: ({ self }, data) => {
        WEB_SOCKET_MAP.get(self).send(data);
      },
    },
    close: {
      close: ({ self }, code, reason) => {
        WEB_SOCKET_MAP.get(self).close(code, reason);
      },
    },
  },
});

export const Exchange = Implement.Exchange.WebSocket(options);
