import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Abstract, SYMBOL } from '@produck/kitty-workflow';

import * as Baseline from './Baseline/index.mjs';

function createDeployerOn(Server, tag) {
  return Baseline.SCP(
    class extends Abstract.Deployer {
      static get [SYMBOL.DEPLOYER._S.TAG]() {
        return tag;
      }

      static get [SYMBOL.DEPLOYER._S.SERVER_CTOR]() {
        return Server;
      }

      static get [SYMBOL.DEPLOYER._S.EXCHANGE_CTOR.HTTP]() {
        return Baseline.HttpExchange;
      }

      static get [SYMBOL.DEPLOYER._S.EXCHANGE_CTOR.WEB_SOCKET]() {
        return undefined;
      }

      [SYMBOL.DEPLOYER._I.INSTALL]() {}
    },
  );
}

describe('::registerDeployer', () => {
  it('should reject a server constructor that is already registered', () => {
    const fixture = Baseline.createDeployer();
    const Deployer = createDeployerOn(fixture.Server, 'duplicate');

    assert.throws(() =>
      Baseline.Kitty.DeployerRegistry.registerDeployer(Deployer),
    );
  });
});

describe('::isAvaiableServer', () => {
  it('should accept a server of a registered deployer', () => {
    const fixture = Baseline.createDeployer();

    assert.equal(
      Baseline.Kitty.DeployerRegistry.isAvaiableServer(new fixture.Server()),
      true,
    );
  });

  it('should reject a server of no registered deployer', () => {
    assert.equal(Baseline.Kitty.DeployerRegistry.isAvaiableServer({}), false);
  });
});
