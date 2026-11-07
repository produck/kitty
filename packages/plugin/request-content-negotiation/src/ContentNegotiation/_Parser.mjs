function parseQuality(_text) {
  const quality = Number.parseFloat(_text);

  if (!Number.isFinite(quality) || quality < 0) {
    return 0;
  }

  return quality > 1 ? 1 : quality;
}

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
