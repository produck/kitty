const EXCHANGE_SOCKET_MAP = new WeakMap();

export function bindExchangeSocket(exchange, socket) {
  EXCHANGE_SOCKET_MAP.set(exchange, socket);
}

export function getSocketByExchange(exchange) {
  return EXCHANGE_SOCKET_MAP.get(exchange);
}
