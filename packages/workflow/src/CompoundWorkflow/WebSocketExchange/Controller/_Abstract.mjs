import { Ow } from '@produck/argot';
import Abstract, { Member as M } from '@produck/es-abstract';

import * as Workflow from '../../../Workflow/index.mjs';
import { PART } from './_Borrow.mjs';
import { I, $I, _I } from './_Symbol.mjs';
import * as P from './_Parser.mjs';

class WebSocketController extends Workflow.Exchange.Part.Concrete {
  [I.UPGRADED] = false;

  upgrade() {
    this[$I.HANDLE_UPGRADE]();
  }

  [$I.HANDLE_UPGRADE]() {
    this[I.ASSERT.NOT_UPGRADED]();
    this[_I.HANDLE_UPGRADE](this[PART.$I.INTERNAL]);
    this[I.UPGRADED] = true;
  }

  get readyState() {
    this[I.ASSERT.UPGRADED]();

    return this[_I.GET_READY_STATE](this[PART.$I.INTERNAL]);
  }

  send(data) {
    this[I.ASSERT.UPGRADED]();
    this[_I.SEND](this[PART.$I.INTERNAL], data);
  }

  close(code, reason) {
    this[I.ASSERT.UPGRADED]();
    this[_I.CLOSE](this[PART.$I.INTERNAL], code, reason);
  }

  [I.ASSERT.NOT_UPGRADED]() {
    if (this[I.UPGRADED]) {
      Ow.Error.Common('The connection has already been upgraded.');
    }
  }

  [I.ASSERT.UPGRADED]() {
    if (!this[I.UPGRADED]) {
      Ow.Error.Common('The connection has not been upgraded.');
    }
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
