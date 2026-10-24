import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Baseline from '../Baseline/index.mjs';

describe('Workflow', () => {
  describe('constructor()', () => {
    it('should reject an external kit that is not a kit', () => {
      const Workflow = Baseline.createWorkflowClass();

      assert.throws(() => new Workflow({}));
    });
  });

  describe('.use()', () => {
    it('should return the workflow for chaining', () => {
      const workflow = Baseline.createWorkflow();

      assert.equal(
        workflow.use((_kit, next) => next()),
        workflow,
      );
    });

    it('should reject a non-function handler', () => {
      const workflow = Baseline.createWorkflow();

      assert.throws(() => workflow.use('handler'));
    });

    it('should reject a handler with more than two parameters', () => {
      const workflow = Baseline.createWorkflow();

      assert.throws(() => workflow.use((_kit, _next, _extra) => {}));
    });

    it('should reject after finalization', () => {
      const workflow = Baseline.createWorkflow();

      workflow.finalize();

      assert.throws(() => workflow.use((_kit, next) => next()));
    });
  });

  describe('.finalize()', () => {
    it('should return the workflow', () => {
      const workflow = Baseline.createWorkflow();

      assert.equal(workflow.finalize(), workflow);
    });

    it('should freeze the workflow', () => {
      const workflow = Baseline.createWorkflow();

      workflow.finalize();

      assert.equal(workflow.isFinalized, true);
      assert.ok(Object.isFrozen(workflow));
    });

    it('should reject a second finalization', () => {
      const workflow = Baseline.createWorkflow();

      workflow.finalize();

      assert.throws(() => workflow.finalize());
    });
  });

  describe('.mixin()', () => {
    it('should reject a non-plugin constructor', () => {
      const workflow = Baseline.createWorkflow();

      assert.throws(() => workflow.mixin(class {}));
    });

    it('should reject after finalization', () => {
      const workflow = Baseline.createWorkflow();
      const Plugin = Baseline.Kitty.Implement.Plugin({
        name: 'probe',
        install: () => {},
      });

      workflow.finalize();

      assert.throws(() => workflow.mixin(Plugin));
    });
  });

  describe('.setRequestBodyDistributorConstructor()', () => {
    it('should reject a constructor outside the distributor contract', () => {
      const workflow = Baseline.createWorkflow();

      assert.throws(() =>
        workflow.setRequestBodyDistributorConstructor(class {}),
      );
    });

    it('should accept a distributor subclass', () => {
      const workflow = Baseline.createWorkflow();

      assert.equal(
        workflow.setRequestBodyDistributorConstructor(Baseline.Distributor),
        workflow,
      );
    });
  });

  describe('.compile()', () => {
    it('should return the manifest record of the deployment', async () => {
      const fixture = Baseline.createDeployer({
        declare: (kit) => {
          kit.declare('request', (_req, _res) => {});
          kit.declare('options', { timeout: 1000 });
        },
      });
      const workflow = Baseline.createWorkflow();

      workflow.finalize();

      const manifest = await workflow.compile(new fixture.Server());

      assert.equal(typeof manifest, 'object');
      assert.deepEqual(Object.keys(manifest).sort(), ['options', 'request']);
      assert.equal(typeof manifest.request, 'function');
      assert.deepEqual(manifest.options, { timeout: 1000 });
    });

    it('should produce an empty manifest when the deployer declares nothing', async () => {
      const fixture = Baseline.createDeployer();
      const workflow = Baseline.createWorkflow();

      workflow.finalize();

      const manifest = await workflow.compile(new fixture.Server());

      assert.deepEqual(manifest, {});
    });

    it('should reject before finalization', async () => {
      const fixture = Baseline.createDeployer();
      const workflow = Baseline.createWorkflow();

      await assert.rejects(() => workflow.compile(new fixture.Server()));
    });
  });

  describe('.deploy()', () => {
    it('should run the linkers in LIFO order', async () => {
      const fixture = Baseline.createDeployer({ linkers: ['first', 'second'] });
      const workflow = Baseline.createWorkflow();

      workflow.finalize();

      await workflow.deploy(new fixture.Server());

      assert.deepEqual(fixture.linkLog, ['second', 'first']);
    });

    it('should reject without a request body distributor', async () => {
      const fixture = Baseline.createDeployer();
      const Workflow = Baseline.createWorkflowClass();
      const workflow = new Workflow(Baseline.Kit.global);

      workflow.finalize();

      await assert.rejects(() => workflow.deploy(new fixture.Server()));
    });

    it('should install the deployer exactly once per deployment', async () => {
      const fixture = Baseline.createDeployer();
      const workflow = Baseline.createWorkflow();

      workflow.finalize();

      await workflow.deploy(new fixture.Server());

      assert.equal(fixture.installLog.length, 1);
    });
  });

  describe('.withDeployer()', () => {
    it('should compile through a one-time deployer', async () => {
      const fixture = Baseline.createDeployer({
        declare: (kit) => kit.declare('request', () => {}),
      });
      const workflow = Baseline.createWorkflow();

      workflow.finalize();

      const handle = workflow.withDeployer(fixture.Deployer);
      const manifest = await handle.compile(new fixture.Server());

      assert.deepEqual(Object.keys(manifest), ['request']);
    });

    it('should reject a second consumption', async () => {
      const fixture = Baseline.createDeployer();
      const workflow = Baseline.createWorkflow();

      workflow.finalize();

      const handle = workflow.withDeployer(fixture.Deployer);

      await handle.compile(new fixture.Server());

      await assert.rejects(() => handle.deploy(new fixture.Server()));
    });
  });

  describe('integration', () => {
    it('should accept a plugin before deployment and reject it afterwards', async () => {
      const fixture = Baseline.createDeployer();
      const workflow = Baseline.createWorkflow();
      const Plugin = Baseline.Kitty.Implement.Plugin({
        name: 'probe',
        install: () => {},
      });

      workflow.mixin(Plugin);
      workflow.finalize();

      await workflow.deploy(new fixture.Server());

      assert.throws(() => workflow.mixin(Plugin));
    });
  });
});
