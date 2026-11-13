// RFC 9110 §12.4.2: qvalue is `0` [ "." *3DIGIT ] / `1` [ "." *3("0") ].
// An absent or malformed weight is not "excluded"; only an explicit value
// outside the range is clamped, and anything unparsable weighs nothing.
function parseQuality(_text) {
  const quality = Number.parseFloat(_text);

  if (!Number.isFinite(quality) || quality < 0) {
    return 0;
  }

  return quality > 1 ? 1 : quality;
}

// RFC 9110 §12.4.1: a missing negotiation field implies no preference.
// §5.6.1.2: a recipient must tolerate stray empty list elements.
// §12.4.2: entries carry an optional `q` weight; parameter names are
// case-insensitive while charset names are matched case-insensitively per §8.3.2.
export function SpecList(_value) {
  if (typeof _value !== 'string') {
    return [];
  }

  const specList = [];

  for (const entry of _value.split(',')) {
    const [rawValue, ...paramList] = entry.split(';');
    const value = rawValue.trim().toLowerCase();

    if (value.length === 0) {
      continue;
    }

    let q = 1;

    for (const param of paramList) {
      const [rawName, rawQuality = ''] = param.split('=');

      if (rawName.trim().toLowerCase() === 'q') {
        q = parseQuality(rawQuality.trim());
      }
    }

    specList.push({ value, q });
  }

  return specList.sort((left, right) => right.q - left.q);
}

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
