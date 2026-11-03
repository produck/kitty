import { STATUS_CODES } from 'node:http';

import { Ow } from '@produck/argot';
import Abstract, { Member as M } from '@produck/es-abstract';

import * as Workflow from '../../../Workflow/index.mjs';
import * as Notifier from './Notifier/index.mjs';
import { PART } from './_Borrow.mjs';
import { I, _I } from './_Symbol.mjs';
import * as P from './_Parser.mjs';

class WebSocketController extends Workflow.Exchange.Part.Concrete {
  [I.UPGRADED] = false;
  [I.REJECTED] = false;
  [I.NOTIFIER] = null;

  constructor(...args) {
    super(...args);

    this[I.NOTIFIER] = new Notifier.Concrete(this);
  }

  get [I.CONTEXT]() {
    return { internal: this[PART.$I.INTERNAL], notifier: this[I.NOTIFIER] };
  }

  get upgraded() {
    return this[I.UPGRADED];
  }

  acceptUpgrade() {
    this[I.ASSERT.PENDING]();
    this[_I.HANDLE_UPGRADE](this[I.CONTEXT]);
    this[I.UPGRADED] = true;
  }

  rejectUpgrade(status = 400, reason = STATUS_CODES[status] ?? '') {
    this[I.ASSERT.PENDING]();
    this[_I.REJECT_UPGRADE](this[I.CONTEXT], status, reason);
    this[I.REJECTED] = true;
  }

  get readyState() {
    this[I.ASSERT.UPGRADED]();

    return this[_I.GET_READY_STATE](this[I.CONTEXT]);
  }

  send(data) {
    this[I.ASSERT.UPGRADED]();
    this[_I.SEND](this[I.CONTEXT], data);
  }

  close(code, reason) {
    this[I.ASSERT.UPGRADED]();
    this[_I.CLOSE](this[I.CONTEXT], code, reason);
  }

  [I.ASSERT.PENDING]() {
    if (this[I.UPGRADED]) {
      Ow.Error.Common('The connection has already been upgraded.');
    }

    if (this[I.REJECTED]) {
      Ow.Error.Common('The connection has already been rejected.');
    }
  }

  [I.ASSERT.UPGRADED]() {
    if (this[I.UPGRADED]) {
      return;
    }

    if (this[I.REJECTED]) {
      Ow.Error.Common('The connection has already been rejected.');
    }

    Ow.Error.Common('The connection has not been upgraded.');
  }
}

export default Abstract(
  WebSocketController,
  Abstract({
    [_I.GET_READY_STATE]: M.Method().args(M.Any).returns(P.ReadyState),
    [_I.HANDLE_UPGRADE]: M.Method().args(M.Any).returns(M.Undefined),
    [_I.REJECT_UPGRADE]: M.Method()
      .args(M.Any, P.RejectStatusCode, P.RejectReason)
      .returns(M.Undefined),
    [_I.SEND]: M.Method().args(M.Any, P.Data).returns(M.Undefined),
    [_I.CLOSE]: M.Method()
      .args(M.Any, P.CloseCode, P.CloseReason)
      .returns(M.Undefined),
  }),
);
