import { SubConstructorProxy as SCP } from '@produck/es-abstract';

import { Abstract, SYMBOL } from '@produck/kitty-workflow';

import ResponseHeader from './ResponseHeader.mjs';

export default SCP(
  class WebSocketResponse extends Abstract.WebSocketResponse {
    static get [SYMBOL.EXCHANGE_RESPONSE._S.HEADER_CTOR]() {
      return ResponseHeader;
    }

    [SYMBOL.EXCHANGE_RESPONSE._I.STATUS.GET](internal) {
      return internal.status;
    }

    [SYMBOL.EXCHANGE_RESPONSE._I.STATUS_TEXT.GET](internal) {
      return internal.statusText;
    }

    [SYMBOL.EXCHANGE_RESPONSE._I.IS_FINISHED]() {
      return true;
    }
  },
);
