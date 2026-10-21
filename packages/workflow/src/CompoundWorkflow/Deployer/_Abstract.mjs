import * as net from 'node:net';

import { Ow, SYMBOL, ThrowTypeError } from '@produck/argot';
import Abstract, { Member as M } from '@produck/es-abstract';
import { SubConstructorOf as M_Sub } from '@produck/es-abstract-member-constructor';
import { isSubConstructor } from '@produck/is-sub-constructor';

import { DependenceName } from '../../Parser.mjs';
import * as HttpExchange from '../HttpExchange/index.mjs';
import * as WebSocketExchange from '../WebSocketExchange/index.mjs';
import { Throw } from './Assert.mjs';
import { DEPLOYMENT } from './_Borrow.mjs';
import { I, $I, _I, _S } from './_Symbol.mjs';

function assertAttacher(value) {
  if (typeof value !== 'function') {
    ThrowTypeError('args[0] as attacher', 'function');
  }
}

function M_SubWebSocketExchangeOrUndefined(value) {
  if (
    value === undefined ||
    isSubConstructor(value, WebSocketExchange.Abstract)
  ) {
    return value;
  }

  ThrowTypeError('member', 'sub-constructor of WebSocketExchange');
}

class Deployer {
  static get name() {
    return this[_S.NAME];
  }

  static get [_S.EXCHANGE_CTOR.WEB_SOCKET]() {
    return undefined;
  }

  constructor(DeployerKit, deployment) {
    this[I.KIT] = DeployerKit;
    this[I.DEPLOYMENT] = deployment;
    this[SYMBOL.CONSTRUCTOR] = new.target;
    this[I.ATTACH.LISTENER]();
    this[I.ATTACH.SERVER_LINKER]();
    this[I.ATTACH.EXCHANGE_ATTACHER]();
    this[I.ATTACH.DEPLOYMENT]();
    this[I.ATTACH.HANDLER.HTTP]();
    this[I.ATTACH.HANDLER.WEB_SOCKET]();
  }

  [I.ATTACH.LISTENER]() {
    this[I.KIT].exportListener = (eventName, listener) => {
      this[I.ASSERT.NOT_COMMITTED]();

      if (typeof eventName !== 'string') {
        ThrowTypeError('args[0] as eventName', 'string');
      }

      if (typeof listener !== 'function') {
        ThrowTypeError('args[1] as listener', 'function');
      }

      this[I.DEPLOYMENT][DEPLOYMENT.$I.SET_LISTENER](eventName, listener);
    };
  }

  [I.ATTACH.SERVER_LINKER]() {
    this[I.KIT].setServerLinker = (link) => {
      this[I.ASSERT.NOT_COMMITTED]();

      if (typeof link !== 'function') {
        ThrowTypeError('args[0] as linker', 'function');
      }

      this[I.DEPLOYMENT][DEPLOYMENT.$I.SET_LINKER](link);
    };
  }

  [I.ATTACH.EXCHANGE_ATTACHER]() {
    this[I.KIT].appendExchangeAttacher = (attacher) => {
      this[I.ASSERT.NOT_COMMITTED]();
      assertAttacher(attacher);
      this[I.DEPLOYMENT][DEPLOYMENT.$I.ADD_EXCHANGE_ATTACHER](attacher);
    };
  }

  [I.ATTACH.DEPLOYMENT]() {
    this[I.KIT].attachDeployment = (name, value) => {
      const deployment = this[I.DEPLOYMENT];

      this[I.ASSERT.NOT_COMMITTED]();
      DependenceName(name);
      deployment[DEPLOYMENT.$I.KIT][name] = value;
    };
  }

  [I.ATTACH.HANDLER.HTTP]() {
    this[I.KIT].handleHttpExchange = async (internal) => {
      const Exchange = this[SYMBOL.CONSTRUCTOR][_S.EXCHANGE_CTOR.HTTP];

      await this[I.DEPLOYMENT][DEPLOYMENT.$I.HANDLE_EXCHANGE](
        Exchange,
        internal,
      );
    };
  }

  [I.ATTACH.HANDLER.WEB_SOCKET]() {
    this[I.KIT].handleWebSocketExchange = async (internal) => {
      const Exchange = this[SYMBOL.CONSTRUCTOR][_S.EXCHANGE_CTOR.WEB_SOCKET];

      if (Exchange === undefined) {
        Throw('It MUST implement a WebSocket exchange.');
      }

      await this[I.DEPLOYMENT][DEPLOYMENT.$I.HANDLE_EXCHANGE](
        Exchange,
        internal,
      );
    };
  }

  [I.ASSERT.NOT_COMMITTED]() {
    if (this[I.DEPLOYMENT][DEPLOYMENT.$I.COMMITTED]) {
      Ow.Error.Common('Deployment has already been committed.');
    }
  }

  [$I.INSTALL]() {
    this[I.ASSERT.NOT_COMMITTED]();
    this[_I.INSTALL](this[I.KIT]);
  }
}

export default Abstract(
  Deployer,
  Abstract({
    [_I.INSTALL]: M.Method().args(M.Any).returns(M.Any),
  }),
  Abstract.Static({
    [_S.NAME]: M.String,
    [_S.SERVER_CTOR]: M_Sub(net.Server),
    [_S.EXCHANGE_CTOR.HTTP]: M_Sub(HttpExchange.Abstract),
    [_S.EXCHANGE_CTOR.WEB_SOCKET]: M_SubWebSocketExchangeOrUndefined,
  }),
);
