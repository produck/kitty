import Abstract, { Member as M } from '@produck/es-abstract';

import * as Workflow from '../../../Workflow/index.mjs';
import { PART } from './_Borrow.mjs';
import { $I, _I } from './_Symbol.mjs';
import * as P from './_Parser.mjs';

class WebSocketController extends Workflow.Exchange.Part.Concrete {
  [$I.HANDLE_UPGRADE]() {
    this[_I.HANDLE_UPGRADE](this[PART.$I.INTERNAL]);
  }

  get readyState() {
    return this[_I.GET_READY_STATE](this[PART.$I.INTERNAL]);
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
    [_I.GET_READY_STATE]: M.Method().args(M.Any).returns(P.ReadyState),
    [_I.HANDLE_UPGRADE]: M.Method().args(M.Any).returns(M.Undefined),
    [_I.SEND]: M.Method().args(M.Any, P.Data).returns(M.Undefined),
    [_I.CLOSE]: M.Method().args(M.Any).rest(M.Any).returns(M.Undefined),
  }),
);
