export function MediaRange(_value) {
  const slash = _value.indexOf('/');

  if (slash <= 0 || slash === _value.length - 1) {
    return null;
  }

  return {
    type: _value.slice(0, slash),
    subtype: _value.slice(slash + 1),
  };
}
