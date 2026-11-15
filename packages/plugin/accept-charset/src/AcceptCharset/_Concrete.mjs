import * as Negotiation from '@produck/kitty-negotiation';

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
    Negotiation.assertCandidateList(candidateList);

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

  [I.SPEC_LIST](name) {
    const value = this[I.EXCHANGE].request.header.get(name);

    return Negotiation.defaultSpec(Negotiation.SpecList(value), '*');
  }

  [I.QUALITY](specList, form) {
    // RFC 9110 §8.3.2: charset names are compared case-insensitively and carry
    // no aliasing, so only an exact name outranks the wildcard.
    return Negotiation.qualityOf(specList, (value) => {
      if (value === form) {
        return 2;
      }
      if (value === '*') {
        return 1;
      }
      return 0;
    });
  }
}
