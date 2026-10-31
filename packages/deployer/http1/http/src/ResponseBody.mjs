const REGISTERED = new WeakSet();

export function register(res) {
  REGISTERED.add(res);
}

export function isRegistered(res) {
  return REGISTERED.has(res);
}
