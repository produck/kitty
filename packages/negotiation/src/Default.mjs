// RFC 9110 §12.4.1: an absent field means no preference, so the wildcard
// carries the default weight and keeps every candidate acceptable.
export function defaultSpec(_value, _defaultValue) {
  return _value.length === 0 ? [{ value: _defaultValue, q: 1 }] : _value;
}
