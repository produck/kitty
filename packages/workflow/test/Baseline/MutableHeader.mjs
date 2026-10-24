import { SubConstructorProxy as SCP } from '@produck/es-abstract';

import { Abstract, SYMBOL } from '@produck/kitty-workflow';

import { responseFacts } from './Internal.mjs';

export default SCP(
  class MutableHeader extends Abstract.ExchangeMutableHeader {
    [SYMBOL.EXCHANGE_RESPONSE_HEADER._I.GET](internal, key) {
      return responseFacts.header(internal, key);
    }

    [SYMBOL.EXCHANGE_RESPONSE_HEADER._I.KEYS](internal) {
      return responseFacts.keys(internal);
    }

    [SYMBOL.EXCHANGE_RESPONSE_MUTABLE_HEADER._I.SET](internal, key, value) {
      responseFacts.setHeader(internal, key, value);
    }

    [SYMBOL.EXCHANGE_RESPONSE_MUTABLE_HEADER._I.DELETE](internal, key) {
      responseFacts.deleteHeader(internal, key);
    }
  },
);
