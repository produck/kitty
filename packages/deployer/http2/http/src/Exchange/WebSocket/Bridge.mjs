import { WebSocketServer } from 'h2ws';

const WEB_SOCKET_SERVER_MAP = new WeakMap();
const WEB_SOCKET_MAP = new WeakMap();

export function getWebSocketServer(server) {
  if (WEB_SOCKET_SERVER_MAP.get(server) === undefined) {
    WEB_SOCKET_SERVER_MAP.set(server, new WebSocketServer({ noServer: true }));
  }

  return WEB_SOCKET_SERVER_MAP.get(server);
}

export function bindWebSocket(key, webSocket) {
  WEB_SOCKET_MAP.set(key, webSocket);
}

export function getWebSocket(key) {
  return WEB_SOCKET_MAP.get(key);
}
