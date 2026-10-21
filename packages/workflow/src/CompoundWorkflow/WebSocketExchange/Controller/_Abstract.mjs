import Abstract, { Member as M } from '@produck/es-abstract';

import * as Workflow from '../../../Workflow/index.mjs';
import { PART } from './_Borrow.mjs';
import { _I } from './_Symbol.mjs';
import * as P from './Parser.mjs';

class WebSocketController extends Workflow.Exchange.Part.Concrete {
  get readyState() {
    return this[_I.READY_STATE.GET](this[PART.$I.INTERNAL]);
  }

  send(data) {
    this[_I.SEND](this[PART.$I.INTERNAL], data);
  }

  close(code, reason) {
    this[_I.CLOSE](this[PART.$I.INTERNAL], code, reason);
  }
}

export default Abstract(
  WebSocketController,
  Abstract({
    [_I.READY_STATE.GET]: M.Method().args(M.Any).returns(P.ReadyState),
    [_I.SEND]: M.Method().args(M.Any, P.Data).returns(M.Undefined),
    [_I.CLOSE]: M.Method().args(M.Any).rest(M.Any).returns(M.Undefined),
  }),
);
