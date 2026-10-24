import { SubConstructorProxy as SCP } from '@produck/es-abstract';

import { Abstract, SYMBOL } from '@produck/kitty-workflow';

import { responseFacts } from './Internal.mjs';
import ResponseHeader from './ResponseHeader.mjs';

export default SCP(
  class Response extends Abstract.ExchangeResponse {
    static get [SYMBOL.EXCHANGE_RESPONSE._S.HEADER_CTOR]() {
      return ResponseHeader;
    }

    [SYMBOL.EXCHANGE_RESPONSE._I.STATUS.GET](internal) {
      return responseFacts.status(internal);
    }

    [SYMBOL.EXCHANGE_RESPONSE._I.STATUS_TEXT.GET](internal) {
      return responseFacts.statusText(internal);
    }

    [SYMBOL.EXCHANGE_RESPONSE._I.IS_FINISHED](internal) {
      return responseFacts.finished(internal);
    }
  },
);
