// RFC 7239 §4: `Forwarded = 1#forwarded-element`, where an element is a
// semicolon separated list of `token [ "=" value ]` pairs. §7.1 allows the
// receiving proxy to append its own element, so a chain arrives as a comma
// separated list ordered from the client toward the origin.
export function ForwardedList(_value) {
  if (typeof _value !== 'string') {
    return [];
  }

  const elementList = [];

  for (const rawElement of splitOutsideQuotes(_value, ',')) {
    const element = Element(rawElement);

    if (element !== null) {
      elementList.push(element);
    }
  }

  return elementList;
}

// RFC 7239 §4: `forwarded-element = [ forwarded-pair ] *( ";" [ forwarded-pair ] )`
// with forwarded-pair = `token "=" value`. Duplicate parameters inside one
// element are invalid, and so is a pair without a value. §5.6.1.2 requires a
// recipient to tolerate stray empty list elements, which answer no entry.
function Element(_rawElement) {
  const pairList = splitOutsideQuotes(_rawElement, ';');

  if (pairList.length === 0) {
    return null;
  }

  const element = {};

  for (const rawPair of pairList) {
    const separator = rawPair.indexOf('=');

    if (separator <= 0) {
      continue;
    }

    const name = rawPair.slice(0, separator).trim().toLowerCase();
    const value = Unquote(rawPair.slice(separator + 1).trim());

    if (name.length === 0 || name in element) {
      return null;
    }

    element[name] = value;
  }

  return Object.keys(element).length === 0 ? null : element;
}

// RFC 7239 §4: value is `token / quoted-string`, so a comma or semicolon
// inside quotes never delimits the list.
function splitOutsideQuotes(_text, _delimiter) {
  const partList = [];
  let buffer = '';
  let quoted = false;

  for (let index = 0; index < _text.length; index++) {
    const character = _text[index];

    if (character === '"') {
      quoted = !quoted;
      buffer += character;
    } else if (character === '\\' && quoted) {
      buffer += character + (_text[++index] ?? '');
    } else if (character === _delimiter && !quoted) {
      partList.push(buffer);
      buffer = '';
    } else {
      buffer += character;
    }
  }

  partList.push(buffer);

  return partList;
}

// RFC 7239 §4: `quoted-string` per RFC 7230 §3.2.6.
function Unquote(_text) {
  if (_text.length < 2 || _text[0] !== '"' || _text.at(-1) !== '"') {
    return _text;
  }

  let result = '';

  for (let index = 1; index < _text.length - 1; index++) {
    const character = _text[index];

    if (character === '\\' && index < _text.length - 2) {
      result += _text[++index];
    } else {
      result += character;
    }
  }

  return result;
}
