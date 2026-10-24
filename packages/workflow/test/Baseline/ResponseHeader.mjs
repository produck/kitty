import { SubConstructorProxy as SCP } from '@produck/es-abstract';

import { Abstract, SYMBOL } from '@produck/kitty-workflow';

import { responseFacts } from './Internal.mjs';

export default SCP(
  class ResponseHeader extends Abstract.ExchangeResponseHeader {
    [SYMBOL.EXCHANGE_RESPONSE_HEADER._I.GET](internal, key) {
      return responseFacts.header(internal, key);
    }

    [SYMBOL.EXCHANGE_RESPONSE_HEADER._I.KEYS](internal) {
      return responseFacts.keys(internal);
    }
  },
);
