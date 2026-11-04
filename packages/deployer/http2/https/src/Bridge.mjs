const WRITTEN_SET = new WeakSet();
const EXCHANGE_SOCKET_MAP = new WeakMap();

export function bindExchangeSocket(exchange, socket) {
  EXCHANGE_SOCKET_MAP.set(exchange, socket);
}

export function getSocketByExchange(exchange) {
  return EXCHANGE_SOCKET_MAP.get(exchange);
}

export function markWritten(response) {
  WRITTEN_SET.add(response);
}

export function hasWritten(response) {
  return WRITTEN_SET.has(response);
}
