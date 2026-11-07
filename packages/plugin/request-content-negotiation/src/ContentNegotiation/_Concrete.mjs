import { Is, ThrowTypeError } from '@produck/argot';

import * as P from './_Parser.mjs';
import { I } from './_Symbol.mjs';

const MEDIA = 'media';
const TOKEN = 'token';
const LANGUAGE = 'language';

const ACCEPT = 'accept';
const ACCEPT_ENCODING = 'accept-encoding';
const ACCEPT_CHARSET = 'accept-charset';
const ACCEPT_LANGUAGE = 'accept-language';

export default class ContentNegotiation {
  constructor(exchange, typeTable) {
    this[I.EXCHANGE] = exchange;
    this[I.TYPE_TABLE] = typeTable;
  }

  accept(...candidateList) {
    this[I.ASSERT](candidateList);

    const specList = this[I.SPEC_LIST](ACCEPT, '*/*');

    return this[I.BEST](MEDIA, specList, candidateList);
  }

  acceptEncoding(...candidateList) {
    this[I.ASSERT](candidateList);

    const specList = this[I.SPEC_LIST](ACCEPT_ENCODING, '*');

    return this[I.BEST](TOKEN, specList, candidateList);
  }

  acceptCharset(...candidateList) {
    this[I.ASSERT](candidateList);

    const specList = this[I.SPEC_LIST](ACCEPT_CHARSET, '*');

    return this[I.BEST](TOKEN, specList, candidateList);
  }

  acceptLanguage(...candidateList) {
    this[I.ASSERT](candidateList);

    const specList = this[I.SPEC_LIST](ACCEPT_LANGUAGE, '*');

    return this[I.BEST](LANGUAGE, specList, candidateList);
  }

  [I.ASSERT](candidateList) {
    if (candidateList.length === 0) {
      ThrowTypeError('args', 'non-empty candidate list');
    }

    for (const [index, value] of candidateList.entries()) {
      if (!Is.Type.String(value) || value.trim().length === 0) {
        ThrowTypeError(`args[${index}] as candidate`, 'non-empty string');
      }
    }
  }

  [I.SPEC_LIST](name, defaultValue) {
    const value = this[I.EXCHANGE].request.header.get(name);
    const specList = P.SpecList(value);

    return specList.length === 0 ? [{ value: defaultValue, q: 1 }] : specList;
  }

  [I.BEST](kind, specList, candidateList) {
    let best = null;
    let bestQuality = 0;

    for (const candidate of candidateList) {
      const formList = this[I.FORM_LIST](kind, candidate);
      const quality = this[I.QUALITY](kind, specList, formList);

      if (quality > bestQuality) {
        best = candidate;
        bestQuality = quality;
      }
    }

    return best === null ? false : best;
  }

  [I.FORM_LIST](kind, candidate) {
    const value = candidate.trim().toLowerCase();

    if (kind !== MEDIA || value.includes('/')) {
      return [value];
    }

    const itemList = this[I.TYPE_TABLE].findByAlias(value);

    return itemList.map(({ mimeType }) => mimeType);
  }

  [I.QUALITY](kind, specList, formList) {
    let quality = 0;

    for (const { value, q } of specList) {
      if (q <= quality) {
        break;
      }

      if (formList.some((form) => this[I.MATCH](kind, value, form))) {
        quality = q;
      }
    }

    return quality;
  }

  [I.MATCH](kind, specValue, form) {
    if (kind === LANGUAGE) {
      return languageMatch(specValue, form);
    }

    if (kind === TOKEN) {
      return specValue === '*' || specValue === form;
    }

    return mediaMatch(specValue, form);
  }
}

function mediaMatch(specValue, form) {
  const spec = P.MediaRange(specValue);
  const candidate = P.MediaRange(form);

  if (spec === null || candidate === null) {
    return false;
  }

  if (candidate.subtype === '*') {
    return (
      candidate.type === '*' ||
      spec.type === '*' ||
      spec.type === candidate.type
    );
  }

  if (spec.type !== '*' && spec.type !== candidate.type) {
    return false;
  }

  return spec.subtype === '*' || spec.subtype === candidate.subtype;
}

function languageMatch(specValue, form) {
  if (specValue === '*' || specValue === form) {
    return true;
  }

  return specValue.startsWith(`${form}-`) || form.startsWith(`${specValue}-`);
}
