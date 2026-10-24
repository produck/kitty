import { SubConstructorProxy as SCP } from '@produck/es-abstract';

import { Abstract, SYMBOL } from '@produck/kitty-workflow';

import { responseFacts } from './Internal.mjs';
import MutableHeader from './MutableHeader.mjs';

export default SCP(
  class MutableResponse extends Abstract.ExchangeMutableResponse {
    static get [SYMBOL.EXCHANGE_RESPONSE._S.HEADER_CTOR]() {
      return MutableHeader;
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

    [SYMBOL.EXCHANGE_MUTABLE_RESPONSE._I.STATUS.SET](internal, code) {
      responseFacts.setStatus(internal, code);
    }

    [SYMBOL.EXCHANGE_MUTABLE_RESPONSE._I.STATUS_TEXT.SET](internal, text) {
      responseFacts.setStatusText(internal, text);
    }
  },
);
