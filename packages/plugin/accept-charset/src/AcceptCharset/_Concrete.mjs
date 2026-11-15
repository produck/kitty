import { Is, ThrowTypeError } from '@produck/argot';

import * as P from './_Parser.mjs';
import { I } from './_Symbol.mjs';

// RFC 9110 §12.5.2 marks Accept-Charset as deprecated.

const ACCEPT_CHARSET = 'accept-charset';

export default class AcceptCharset {
  constructor(exchange, charset) {
    this[I.EXCHANGE] = exchange;
    this[I.CHARSET] = charset;

    this.acceptCharset = (...args) => this[I.ACCEPT_CHARSET](...args);
  }

  [I.ACCEPT_CHARSET](...candidateList) {
    this[I.ASSERT](candidateList);

    const specList = this[I.SPEC_LIST](ACCEPT_CHARSET);

    let best = false;
    let bestQuality = 0;

    for (const candidate of candidateList) {
      const quality = this[I.QUALITY](specList, candidate.toLowerCase());

      if (quality > bestQuality) {
        best = candidate;
        bestQuality = quality;
      }
    }

    return best;
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

  [I.SPEC_LIST](name) {
    const value = this[I.EXCHANGE].request.header.get(name);
    const specList = P.SpecList(value);

    // RFC 9110 §12.4.1: an absent field means no preference, so every
    // candidate stays acceptable; the wildcard carries the default weight.
    return specList.length === 0 ? [{ value: '*', q: 1 }] : specList;
  }

  [I.QUALITY](specList, form) {
    let matchedSpecificity = -1;
    let quality = 0;

    // RFC 9110 §12.5.2: charsets are compared by name, case-insensitively
    // (§8.3.2). An exact name is more specific than `*`, so an explicit
    // `charset;q=0` exclusion outranks the wildcard.
    for (const { value, q } of specList) {
      const specificity = value === form ? 2 : value === '*' ? 1 : 0;

      if (specificity === 0 || specificity <= matchedSpecificity) {
        continue;
      }

      matchedSpecificity = specificity;
      quality = q;
    }

    return quality;
  }
}
