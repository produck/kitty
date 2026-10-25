import * as net from 'node:net';

import { Ow, SYMBOL, ThrowTypeError } from '@produck/argot';
import Abstract, { Member as M } from '@produck/es-abstract';
import { SubConstructorOf as M_Sub } from '@produck/es-abstract-member-constructor';
import { isSubConstructor } from '@produck/is-sub-constructor';
import * as Kit from '@produck/kit';

import * as P from './_Parser.mjs';
import * as HttpExchange from '../HttpExchange/index.mjs';
import * as WebSocketExchange from '../WebSocketExchange/index.mjs';
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
  static get tag() {
    return this[_S.TAG];
  }

  static get [_S.EXCHANGE_CTOR.WEB_SOCKET]() {
    return undefined;
  }

  constructor(DeploymentKit, deployment) {
    if (!Kit.isKit(DeploymentKit)) {
      ThrowTypeError('args[0] as DeploymentKit', 'Kit');
    }

    this[I.KIT] = DeploymentKit('Kitty<Deployer>');
    this[I.DEPLOYMENT] = deployment;
    this[SYMBOL.CONSTRUCTOR] = new.target;
    this[I.ATTACH.MANIFEST]();
    this[I.ATTACH.SERVER_LINKER]();
    this[I.ATTACH.EXCHANGE_ATTACHER]();
    this[I.ATTACH.DEPLOYMENT]();
    this[I.ATTACH.HANDLER.HTTP]();
    this[I.ATTACH.HANDLER.WEB_SOCKET]();
  }

  [I.ATTACH.MANIFEST]() {
    this[I.KIT].declare = (name, value) => {
      this[I.ASSERT.NOT_COMMITTED]();

      if (typeof name !== 'string') {
        ThrowTypeError('args[0] as name', 'string');
      }

      this[I.DEPLOYMENT][DEPLOYMENT.$I.DECLARE](name, value);
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
      P.DependenceName(name);
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
        Ow.Error.Common('It MUST implement a WebSocket exchange.');
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
    [_I.INSTALL]: M.Method().args(P.Kit),
  }),
  Abstract.Static({
    [_S.TAG]: M.String,
    [_S.SERVER_CTOR]: M_Sub(net.Server),
    [_S.EXCHANGE_CTOR.HTTP]: M_Sub(HttpExchange.Abstract),
    [_S.EXCHANGE_CTOR.WEB_SOCKET]: M_SubWebSocketExchangeOrUndefined,
  }),
);
