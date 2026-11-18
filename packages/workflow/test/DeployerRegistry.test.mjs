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

describe('::mountDeployer()', () => {
  it('should answer this for chaining', () => {
    const fixture = Baseline.createDeployer();
    const workflow = Baseline.createWorkflow();

    assert.equal(workflow.mountDeployer(fixture.Deployer), workflow);
  });

  it('should reject a server constructor that is already registered', () => {
    const fixture = Baseline.createDeployer();
    const Deployer = createDeployerOn(fixture.Server, 'duplicate');
    const workflow = Baseline.createWorkflow();

    workflow.mountDeployer(fixture.Deployer);

    assert.throws(() => workflow.mountDeployer(Deployer));
  });

  it('should reject a non deployer', () => {
    const workflow = Baseline.createWorkflow();

    assert.throws(() => workflow.mountDeployer(class {}));
  });

  it('should reject a call after finalize', () => {
    const fixture = Baseline.createDeployer();
    const workflow = Baseline.createWorkflow();

    workflow.finalize();

    assert.throws(() => workflow.mountDeployer(fixture.Deployer));
  });

  it('should keep each workflow instance on its own registry', () => {
    const fixture = Baseline.createDeployer();
    const Left = Baseline.createWorkflow();
    const Right = Baseline.createWorkflow();

    Left.mountDeployer(fixture.Deployer);

    assert.notEqual(Left.DeployerRegistry, Right.DeployerRegistry);
    assert.doesNotThrow(() => Right.mountDeployer(fixture.Deployer));
  });

  it('should accept the same server constructor on a sibling instance', () => {
    const fixture = Baseline.createDeployer();
    const Left = Baseline.createWorkflow();
    const Right = Baseline.createWorkflow();

    Left.mountDeployer(fixture.Deployer);

    assert.doesNotThrow(() => Right.mountDeployer(fixture.Deployer));
  });
});

describe('>deploy', () => {
  it('should answer a deployment for the registered server type', async () => {
    const fixture = Baseline.createDeployer();
    const workflow = Baseline.createWorkflow();

    workflow.mountDeployer(fixture.Deployer);
    workflow.finalize();

    const deployment = await workflow.compile(new fixture.Server());

    assert.ok(deployment !== undefined);
  });

  it('should reject a server type without a deployer', async () => {
    const workflow = Baseline.createWorkflow();

    workflow.finalize();

    await assert.rejects(() =>
      workflow.compile(new (class ForeignServer {})()),
    );
  });
});
