import { WebSocketServer } from 'ws';

import { Implement } from '@produck/kitty-workflow';

import * as Base from './Base.mjs';

const server = new WebSocketServer({ noServer: true });

export const options = Implement.Normalize.Exchange.WebSocket({
  identity: Base.identity,
  server: Base.server,
  httpVersion: Base.httpVersion,
  request: Base.request,
  response: Base.response,
  controller: {
    handleUpgrade: ({ internal }) => {
      server.handleUpgrade(
        internal.req,
        internal.socket,
        internal.head,
        (ws) => {
          internal.socket = ws;
        },
      );
    },
    readyState: {
      get: ({ internal }) => internal.socket.readyState,
    },
    send: {
      send: ({ internal }, data) => {
        internal.socket.send(data);
      },
    },
    close: {
      close: ({ internal }, code, reason) => {
        internal.socket.close(code, reason);
      },
    },
  },
});

export const Exchange = Implement.Exchange.WebSocket(options);
