// RFC 9110 §12.5: the most specific matching range decides the weight, so an
// explicit `value;q=0` exclusion outranks a broader wildcard. Specificity is
// answered by the caller because each field family ranks its own ranges.
export function qualityOf(_specList, _specificityOf) {
  let matchedSpecificity = 0;
  let quality = 0;

  for (const { value, q } of _specList) {
    const specificity = _specificityOf(value);

    if (specificity === 0 || specificity <= matchedSpecificity) {
      continue;
    }

    matchedSpecificity = specificity;
    quality = q;
  }

  return quality;
}
