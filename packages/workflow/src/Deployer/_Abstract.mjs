import * as net from 'node:net';

import { Ow, ThrowTypeError } from '@produck/argot';
import Abstract, { Member as M } from '@produck/es-abstract';
import { SubConstructorOf as M_Sub } from '@produck/es-abstract-member-constructor';

import * as HttpExchange from '../HttpExchange/index.mjs';
import * as WebSocketExchange from '../WebSocketExchange/index.mjs';
import { I, $I, _I, _S } from './_Symbol.mjs';

function assertAttacher(value) {
  if (typeof value !== 'function') {
    ThrowTypeError('args[0] as attacher', 'function');
  }
}

class Deployer {
  [$I.LISTENERS] = {};
  [$I.LINK_LIST] = [];
  [I.EXCHANGE_ATTACHER_LIST] = [];
  [I.INSTALLED] = false;

  static get name() {
    return this[_S.NAME];
  }

  constructor(DeployerKit) {
    this[I.KIT] = DeployerKit;
    this[I.ATTACH.LISTENER]();
    this[I.ATTACH.SERVER_LINKER]();
    this[I.ATTACH.EXCHANGE_ATTACHER]();
  }

  [I.ATTACH.LISTENER]() {
    this[I.KIT].exportListener = (eventName, listener) => {
      this[I.ASSERT.NOT_INSTALLED]();

      if (typeof eventName !== 'string') {
        ThrowTypeError('args[0] as eventName', 'string');
      }

      if (typeof listener !== 'function') {
        ThrowTypeError('args[1] as listener', 'function');
      }

      this[$I.LISTENERS][eventName] = listener;
    };
  }

  [I.ATTACH.SERVER_LINKER]() {
    this[I.KIT].setServerLinker = (link) => {
      this[I.ASSERT.NOT_INSTALLED]();

      if (typeof link !== 'function') {
        ThrowTypeError('args[0] as linker', 'function');
      }

      this[$I.LINK_LIST].unshift(link);
    };
  }

  [I.ATTACH.EXCHANGE_ATTACHER]() {
    this[I.KIT].appendExchangeAttacher = (attacher) => {
      this[I.ASSERT.NOT_INSTALLED]();
      assertAttacher(attacher);
      this[I.EXCHANGE_ATTACHER_LIST].push(attacher);
    };
  }

  [$I.ATTACH_EXCHANGE](ExchangeKit) {
    for (const attacher of this[I.EXCHANGE_ATTACHER_LIST]) {
      attacher(ExchangeKit);
    }
  }

  [I.ASSERT.NOT_INSTALLED]() {
    if (this[I.INSTALLED]) {
      Ow.Error.Common('Deployer has already been installed.');
    }
  }

  [$I.INSTALL]() {
    this[_I.INSTALL](this[I.KIT]);
    this[I.INSTALLED] = true;
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
    [_S.EXCHANGE_CTOR.WEBSOCKET]: M_Sub(WebSocketExchange.Abstract),
  }),
);
