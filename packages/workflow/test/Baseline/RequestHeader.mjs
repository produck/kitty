import { SubConstructorProxy as SCP } from '@produck/es-abstract';

import { Abstract, SYMBOL } from '@produck/kitty-workflow';

import { requestFacts } from './Internal.mjs';

export default SCP(
  class RequestHeader extends Abstract.ExchangeRequestHeader {
    [SYMBOL.EXCHANGE_REQUEST_HEADER._I.GET](internal, key) {
      return requestFacts.header(internal, key);
    }

    [SYMBOL.EXCHANGE_REQUEST_HEADER._I.KEYS](internal) {
      return requestFacts.keys(internal);
    }
  },
);
