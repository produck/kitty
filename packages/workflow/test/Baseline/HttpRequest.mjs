import { SubConstructorProxy as SCP } from '@produck/es-abstract';

import { Abstract, SYMBOL } from '@produck/kitty-workflow';

import HttpRequestBody from './HttpRequestBody.mjs';
import { requestFacts } from './Internal.mjs';
import RequestHeader from './RequestHeader.mjs';

export default SCP(
  class HttpRequest extends Abstract.HttpRequest {
    static get [SYMBOL.EXCHANGE_REQUEST._S.HEADER_CTOR]() {
      return RequestHeader;
    }

    static get [SYMBOL.HTTP_REQUEST._S.BODY_CTOR]() {
      return HttpRequestBody;
    }

    [SYMBOL.EXCHANGE_REQUEST._I.METHOD.GET](internal) {
      return requestFacts.method(internal);
    }

    [SYMBOL.EXCHANGE_REQUEST._I.URL.GET](internal) {
      return requestFacts.url(internal);
    }
  },
);
