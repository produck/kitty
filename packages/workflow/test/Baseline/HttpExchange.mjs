import { SubConstructorProxy as SCP } from '@produck/es-abstract';

import { Abstract, SYMBOL } from '@produck/kitty-workflow';

import HttpRequest from './HttpRequest.mjs';
import HttpResponse from './HttpResponse.mjs';
import { exchangeFacts } from './Internal.mjs';

export default SCP(
  class HttpExchange extends Abstract.HttpExchange {
    static get [SYMBOL.EXCHANGE._S.REQUEST_CTOR]() {
      return HttpRequest;
    }

    static get [SYMBOL.EXCHANGE._S.RESPONSE_CTOR]() {
      return HttpResponse;
    }

    [SYMBOL.EXCHANGE._I.HTTP_VERSION](internal) {
      return exchangeFacts.httpVersion(internal);
    }

    static [SYMBOL.EXCHANGE._S.IDENTITY](internal) {
      return exchangeFacts.identity(internal);
    }

    [SYMBOL.EXCHANGE._I.SERVER.GET](internal) {
      return exchangeFacts.server(internal);
    }

    [SYMBOL.EXCHANGE._I.SERVER.PROTOCOL.GET](internal) {
      return exchangeFacts.protocol(internal);
    }
  },
);
