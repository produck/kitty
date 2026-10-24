import { SubConstructorProxy as SCP } from '@produck/es-abstract';

import { Abstract, SYMBOL } from '@produck/kitty-workflow';

export default SCP(
  class WebSocketController extends Abstract.WebSocketController {
    [SYMBOL.WEB_SOCKET_CONTROLLER._I.READY_STATE.GET](internal) {
      return internal.socket.readyState;
    }

    [SYMBOL.WEB_SOCKET_CONTROLLER._I.SEND](internal, data) {
      internal.socket.sent.push(data);
    }

    [SYMBOL.WEB_SOCKET_CONTROLLER._I.CLOSE](internal, code, reason) {
      internal.socket.closed = { code, reason };
    }
  },
);
