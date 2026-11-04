const WRITTEN_SET = new WeakSet();

export function markWritten(response) {
  WRITTEN_SET.add(response);
}

export function hasWritten(response) {
  return WRITTEN_SET.has(response);
}
