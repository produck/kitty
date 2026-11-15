import * as Negotiation from '@produck/kitty-negotiation';

import * as P from './_Parser.mjs';
import { I } from './_Symbol.mjs';

const MEDIA = 'media';
const TOKEN = 'token';
const LANGUAGE = 'language';

// RFC 9110 §12.5.1 Accept, §12.5.3 Accept-Encoding,
// §12.5.4 Accept-Language.

const ACCEPT = 'accept';
const ACCEPT_ENCODING = 'accept-encoding';
const ACCEPT_LANGUAGE = 'accept-language';

export default class ContentNegotiation {
  constructor(exchange, typeTable) {
    this[I.EXCHANGE] = exchange;
    this[I.TYPE_TABLE] = typeTable;

    this.accept = (...args) => this[I.ACCEPT](...args);
    this.acceptEncoding = (...args) => this[I.ACCEPT_ENCODING](...args);
    this.acceptLanguage = (...args) => this[I.ACCEPT_LANGUAGE](...args);
  }

  [I.ACCEPT](...candidateList) {
    Negotiation.assertCandidateList(candidateList);

    const specList = this[I.SPEC_LIST](ACCEPT, '*/*');

    return this[I.BEST](MEDIA, specList, candidateList);
  }

  [I.ACCEPT_ENCODING](...candidateList) {
    Negotiation.assertCandidateList(candidateList);

    const specList = this[I.SPEC_LIST](ACCEPT_ENCODING, '*');

    // RFC 9110 §12.5.3: content codings are compared case-insensitively.
    return this[I.BEST](TOKEN, specList, candidateList);
  }

  [I.ACCEPT_LANGUAGE](...candidateList) {
    Negotiation.assertCandidateList(candidateList);

    const specList = this[I.SPEC_LIST](ACCEPT_LANGUAGE, '*');

    return this[I.BEST](LANGUAGE, specList, candidateList);
  }

  [I.SPEC_LIST](name, defaultValue) {
    const value = this[I.EXCHANGE].request.header.get(name);

    return Negotiation.defaultSpec(Negotiation.SpecList(value), defaultValue);
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

    if (kind === TOKEN) {
      return codingFormList(value);
    }

    if (kind !== MEDIA || value.includes('/')) {
      return [value];
    }

    const itemList = this[I.TYPE_TABLE].findByAlias(value);

    return itemList.map(({ mimeType }) => mimeType);
  }

  [I.QUALITY](kind, specList, formList) {
    // RFC 9110 §12.5.1: the most specific matching media range decides the
    // weight, so an explicit `range;q=0` outranks a broader wildcard.
    return Negotiation.qualityOf(specList, (value) => {
      if (!formList.some((form) => this[I.MATCH](kind, value, form))) {
        return 0;
      }

      return this[I.SPECIFICITY](kind, value);
    });
  }

  [I.SPECIFICITY](kind, value) {
    if (kind === LANGUAGE) {
      return value === '*' ? 1 : 2;
    }

    if (kind === TOKEN) {
      return value === '*' ? 1 : 2;
    }

    const range = P.MediaRange(value);

    if (range === null) {
      return 0;
    }

    if (range.type === '*') {
      return 1;
    }

    return range.subtype === '*' ? 2 : 3;
  }

  [I.MATCH](kind, specValue, form) {
    if (kind === LANGUAGE) {
      return languageMatch(specValue, form);
    }

    if (kind === TOKEN) {
      return specValue === '*' || codingFormList(specValue).includes(form);
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

  // RFC 9110 §12.5.1: `*/*` covers every type, `type/*` covers every subtype
  // of that type. A wildcard on the candidate side still has to be covered
  // by the range.
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

// RFC 4647 §3.3.1 Basic Filtering: a range matches a tag when it equals the
// tag or is a prefix of it ending at a hyphen boundary. The relation is
// one-way; a more specific range never matches a shorter tag.
function languageMatch(range, tag) {
  if (range === '*') {
    return true;
  }

  if (range === tag) {
    return true;
  }

  return tag.startsWith(`${range}-`);
}

// RFC 9110 §8.4.1.1: a recipient SHOULD consider `x-compress` equivalent to
// `compress`. §8.4.1.3: a recipient SHOULD consider `x-gzip` equivalent to
// `gzip`. Both are registered as deprecated aliases (§18.6), so each name
// answers the whole equivalence class in whichever direction it is used.
const CODING_EQUIVALENT_LIST = [
  ['compress', 'x-compress'],
  ['gzip', 'x-gzip'],
];

function codingFormList(value) {
  for (const equivalentList of CODING_EQUIVALENT_LIST) {
    if (equivalentList.includes(value)) {
      return equivalentList;
    }
  }

  return [value];
}
