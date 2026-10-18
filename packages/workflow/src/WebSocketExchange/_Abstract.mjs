import { SubConstructorProxy as SCP } from '@produck/es-abstract';

import * as Exchange from '../Exchange/index.mjs';
import { EXCHANGE } from './_Borrow.mjs';

class WebSocketExchange extends Exchange.Abstract {
  [EXCHANGE._I.MODE]() {
    return 'websocket';
  }
}

export default SCP(WebSocketExchange);
