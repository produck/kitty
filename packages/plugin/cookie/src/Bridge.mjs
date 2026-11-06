import * as ExchangeCookie from './ExchangeCookie/index.mjs';

const EXCHANGE_COOKIE_MAP = new WeakMap();

export function get(exchange) {
  if (!EXCHANGE_COOKIE_MAP.has(exchange)) {
    EXCHANGE_COOKIE_MAP.set(exchange, new ExchangeCookie.Concrete(exchange));
  }

  return EXCHANGE_COOKIE_MAP.get(exchange);
}
