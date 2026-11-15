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
// case-insensitive.
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

  return specList;
}
