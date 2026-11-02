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

describe('.register()', () => {
  it('should reject a server constructor that is already registered', () => {
    const fixture = Baseline.createDeployer();
    const Deployer = createDeployerOn(fixture.Server, 'duplicate');
    const registry = Baseline.createWorkflowClass().DeployerRegistry;

    registry.register(fixture.Deployer);

    assert.throws(() => registry.register(Deployer));
  });

  it('should keep each workflow class on its own registry', () => {
    const fixture = Baseline.createDeployer();
    const Left = Baseline.createWorkflowClass();
    const Right = Baseline.createWorkflowClass();

    Left.DeployerRegistry.register(fixture.Deployer);

    assert.equal(
      Left.DeployerRegistry.isAvaiableServer(new fixture.Server()),
      true,
    );
    assert.equal(
      Right.DeployerRegistry.isAvaiableServer(new fixture.Server()),
      false,
    );
  });
});

describe('>derived workflow class', () => {
  it('should not reuse a registry the base class has already built', () => {
    const Base = Baseline.createWorkflowClass();
    const Derived = class DerivedWorkflow extends Base {};

    const baseRegistry = Base.DeployerRegistry;
    const derivedRegistry = Derived.DeployerRegistry;

    assert.notEqual(derivedRegistry, baseRegistry);
  });

  it('should accept the same server constructor independently of the base', () => {
    const fixture = Baseline.createDeployer();
    const Base = Baseline.createWorkflowClass();
    const Derived = class DerivedWorkflow extends Base {};

    Base.DeployerRegistry.register(fixture.Deployer);

    assert.doesNotThrow(() =>
      Derived.DeployerRegistry.register(fixture.Deployer),
    );
  });
});

describe('.isAvaiableServer()', () => {
  it('should accept a server of a registered deployer', () => {
    const fixture = Baseline.createDeployer();
    const registry = Baseline.createWorkflowClass().DeployerRegistry;

    registry.register(fixture.Deployer);

    assert.equal(registry.isAvaiableServer(new fixture.Server()), true);
  });

  it('should reject a server of no registered deployer', () => {
    assert.equal(
      Baseline.createWorkflowClass().DeployerRegistry.isAvaiableServer({}),
      false,
    );
  });
});
