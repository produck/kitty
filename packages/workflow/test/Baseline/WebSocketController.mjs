import { SubConstructorProxy as SCP } from '@produck/es-abstract';

import { Abstract, SYMBOL } from '@produck/kitty-workflow';

import * as WebSocketControllerEvent from '../../src/CompoundWorkflow/WebSocketExchange/Controller/Event.mjs';

export default SCP(
  class WebSocketController extends Abstract.WebSocketController {
    [SYMBOL.WEB_SOCKET_CONTROLLER._I.HANDLE_UPGRADE](context) {
      context.internal.upgraded = true;
      context.internal.notifier = context.notifier;
    }

    [SYMBOL.WEB_SOCKET_CONTROLLER._I.REJECT_UPGRADE](context, status, reason) {
      context.internal.rejected = { status, reason };
    }

    [SYMBOL.WEB_SOCKET_CONTROLLER._I.GET_READY_STATE](context) {
      const { readyState = WebSocketControllerEvent.READY_STATE.OPEN } =
        context.internal.socket;

      return readyState;
    }

    [SYMBOL.WEB_SOCKET_CONTROLLER._I.SEND](context, data) {
      context.internal.socket.sent.push(data);
    }

    [SYMBOL.WEB_SOCKET_CONTROLLER._I.CLOSE](context, code, reason) {
      context.internal.socket.closed = { code, reason };

      context.notifier.close(code, reason);
    }
  },
);
