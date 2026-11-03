const MAP = new WeakMap();

export function bind(request, raw, body) {
  MAP.set(request, { raw, body });
}

export function get(request) {
  return MAP.get(request);
}
