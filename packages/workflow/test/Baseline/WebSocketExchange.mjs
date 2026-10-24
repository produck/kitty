import { SubConstructorProxy as SCP } from '@produck/es-abstract';

import { Abstract, SYMBOL } from '@produck/kitty-workflow';

import { exchangeFacts } from './Internal.mjs';
import Request from './Request.mjs';
import WebSocketController from './WebSocketController.mjs';
import WebSocketResponse from './WebSocketResponse.mjs';

export default SCP(
  class WebSocketExchange extends Abstract.WebSocketExchange {
    static get [SYMBOL.WEB_SOCKET_EXCHANGE._S.CONTROLLER_CTOR]() {
      return WebSocketController;
    }

    static get [SYMBOL.EXCHANGE._S.REQUEST_CTOR]() {
      return Request;
    }

    static get [SYMBOL.EXCHANGE._S.RESPONSE_CTOR]() {
      return WebSocketResponse;
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
