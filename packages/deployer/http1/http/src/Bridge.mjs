const RAW_MAP = new WeakMap();
const RESPONSE_SET = new WeakSet();

export function bindRaw(exchange, raw, body) {
  RAW_MAP.set(exchange, { raw, body });
}

export function getRaw(exchange) {
  return RAW_MAP.get(exchange);
}

export function registerResponse(response) {
  RESPONSE_SET.add(response);
}

export function hasResponse(response) {
  return RESPONSE_SET.has(response);
}
