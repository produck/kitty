import { SubConstructorProxy as SCP } from '@produck/es-abstract';

import {
  Abstract,
  SYMBOL,
  WebSocketControllerEvent,
} from '@produck/kitty-workflow';

export default SCP(
  class WebSocketController extends Abstract.WebSocketController {
    [SYMBOL.WEB_SOCKET_CONTROLLER._I.HANDLE_UPGRADE](internal) {
      internal.upgraded = true;
    }

    [SYMBOL.WEB_SOCKET_CONTROLLER._I.GET_READY_STATE](internal) {
      const { readyState = WebSocketControllerEvent.READY_STATE.OPEN } =
        internal.socket;

      return readyState;
    }

    [SYMBOL.WEB_SOCKET_CONTROLLER._I.SEND](internal, data) {
      internal.socket.sent.push(data);
    }

    [SYMBOL.WEB_SOCKET_CONTROLLER._I.CLOSE](internal, code, reason) {
      internal.socket.closed = { code, reason };

      this.dispatchEvent(new WebSocketControllerEvent.Close(code, reason));
    }
  },
);
