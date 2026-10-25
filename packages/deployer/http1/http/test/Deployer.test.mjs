import * as http from 'node:http';

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Abstract, DeployerRegistry, SYMBOL } from '@produck/kitty-workflow';

import { Deployer, register } from '@produck/kitty-deployer-http1-http';

describe('Deployer', () => {
  describe('::TAG', () => {
    it('should be a non-empty string', () => {
      const tag = Deployer[SYMBOL.DEPLOYER._S.TAG];

      assert.equal(typeof tag, 'string');
      assert.notEqual(tag.length, 0);
    });
  });

  describe('::SERVER_CTOR', () => {
    it('should target the plaintext http server', () => {
      const Server = Deployer[SYMBOL.DEPLOYER._S.SERVER_CTOR];

      assert.equal(Server, http.Server);
    });
  });

  describe('::EXCHANGE_CTOR.HTTP', () => {
    it('should expose a subclass of the abstract http exchange', () => {
      const Exchange = Deployer[SYMBOL.DEPLOYER._S.EXCHANGE_CTOR.HTTP];

      assert.ok(Exchange.prototype instanceof Abstract.HttpExchange);
    });
  });

  describe('::EXCHANGE_CTOR.WEB_SOCKET', () => {
    it('should serve no websocket', () => {
      const WebSocket = Deployer[SYMBOL.DEPLOYER._S.EXCHANGE_CTOR.WEB_SOCKET];

      assert.equal(WebSocket, undefined);
    });
  });

  describe('register()', () => {
    it('should register the deployer by its server constructor', () => {
      assert.equal(register(), Deployer);
    });

    it('should be resolvable through the registry', () => {
      assert.equal(DeployerRegistry.getByServer(new http.Server()), Deployer);
    });
  });
});
