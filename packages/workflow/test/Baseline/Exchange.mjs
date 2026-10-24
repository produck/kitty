import { SubConstructorProxy as SCP } from '@produck/es-abstract';

import { Abstract, SYMBOL } from '@produck/kitty-workflow';

import { exchangeFacts } from './Internal.mjs';
import Request from './Request.mjs';
import Response from './Response.mjs';

export default SCP(
  class Exchange extends Abstract.Exchange {
    static get [SYMBOL.EXCHANGE._S.REQUEST_CTOR]() {
      return Request;
    }

    static get [SYMBOL.EXCHANGE._S.RESPONSE_CTOR]() {
      return Response;
    }

    [SYMBOL.EXCHANGE._I.HTTP_VERSION](internal) {
      return exchangeFacts.httpVersion(internal);
    }

    [SYMBOL.EXCHANGE._I.IDENTITY.GET](internal) {
      return exchangeFacts.identity(internal);
    }

    [SYMBOL.EXCHANGE._I.MODE](internal) {
      return exchangeFacts.mode(internal);
    }

    [SYMBOL.EXCHANGE._I.SERVER.GET](internal) {
      return exchangeFacts.server(internal);
    }

    [SYMBOL.EXCHANGE._I.SERVER.PROTOCOL.GET](internal) {
      return exchangeFacts.protocol(internal);
    }
  },
);
