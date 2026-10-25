import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SYMBOL } from '@produck/kitty-workflow';

import * as Baseline from '../Baseline/index.mjs';

function runInstall(install) {
  const workflow = Baseline.createWorkflow();
  const result = { error: null, workflow };

  try {
    workflow.mixin(Baseline.createPlugin({ name: 'probe', install }));
    workflow.finalize();
  } catch (error) {
    result.error = error;
  }

  return result;
}

describe('Plugin', () => {
  describe('::name', () => {
    it('should return the configured name', () => {
      const Plugin = Baseline.createPlugin({
        name: 'probe',
        install: () => {},
      });

      assert.equal(Plugin.name, 'probe');
    });
  });

  describe('construction', () => {
    it('should reject a workflow kit that is not a kit', () => {
      const Plugin = Baseline.createPlugin();

      assert.throws(() => new Plugin({}, Baseline.createWorkflow()));
    });
  });

  describe('[INSTALL]', () => {
    it('should reject an install argument that is not a kit', () => {
      const Plugin = Baseline.createPlugin();
      const plugin = new Plugin(Baseline.Kit.global, Baseline.createWorkflow());

      assert.throws(() => plugin[SYMBOL.PLUGIN._I.INSTALL]({}));
    });
  });

  describe('.attachWorkflow()', () => {
    it('should attach a value to the workflow kit', () => {
      const { error } = runInstall((kit) => kit.attachWorkflow('probe', 1));

      assert.equal(error, null);
    });

    it('should reject a duplicate dependence name', () => {
      const { error } = runInstall((kit) => {
        kit.attachWorkflow('probe', 1);
        kit.attachWorkflow('probe', 2);
      });

      assert.notEqual(error, null);
    });

    it('should reject a non-string dependence name', () => {
      const { error } = runInstall((kit) => kit.attachWorkflow(1, 'probe'));

      assert.notEqual(error, null);
    });

    it('should reject after the workflow finalizes', () => {
      let captured = null;

      runInstall((kit) => {
        captured = kit;
      });

      assert.throws(() => captured.attachWorkflow('late', 1));
    });
  });

  describe('.appendDeploymentAttacher()', () => {
    it('should register a deployment attacher', async () => {
      const seen = [];
      const workflow = Baseline.createWorkflow();

      workflow.mixin(
        Baseline.createPlugin({
          name: 'probe',
          install: (kit) => {
            kit.appendDeploymentAttacher((DeploymentKit) =>
              seen.push(DeploymentKit),
            );
          },
        }),
      );
      workflow.finalize();

      const fixture = Baseline.createDeployer();

      await workflow.compile(new fixture.Server());

      assert.equal(seen.length, 1);
    });

    it('should reject a non-function attacher', () => {
      const { error } = runInstall((kit) =>
        kit.appendDeploymentAttacher('probe'),
      );

      assert.notEqual(error, null);
    });
  });

  describe('.appendExchangeAttacher()', () => {
    it('should register an exchange attacher', async () => {
      const seen = [];
      const workflow = Baseline.createWorkflow();

      workflow.mixin(
        Baseline.createPlugin({
          name: 'probe',
          install: (kit) => {
            kit.appendExchangeAttacher((ExchangeKit) => seen.push(ExchangeKit));
          },
        }),
      );
      workflow.finalize();

      const fixture = Baseline.createDeployer();

      await workflow.deploy(new fixture.Server());
      await fixture.installLog[0].handleHttpExchange(Baseline.createInternal());

      assert.equal(seen.length, 1);
    });

    it('should reject a non-function attacher', () => {
      const { error } = runInstall((kit) =>
        kit.appendExchangeAttacher('probe'),
      );

      assert.notEqual(error, null);
    });
  });

  describe('.appendPrefixHandler()', () => {
    it('should register prefix handlers', async () => {
      const order = [];
      const workflow = Baseline.createWorkflow();

      workflow.use(() => {
        order.push('main');
      });
      workflow.mixin(
        Baseline.createPlugin({
          name: 'probe',
          install: (kit) => {
            kit.appendPrefixHandler((_ctx, next) => {
              order.push('prefix');

              return next();
            });
          },
        }),
      );
      workflow.finalize();

      const fixture = Baseline.createDeployer();

      await workflow.deploy(new fixture.Server());
      await fixture.installLog[0].handleHttpExchange(Baseline.createInternal());

      assert.deepEqual(order, ['prefix', 'main']);
    });

    it('should reject a non-function handler', () => {
      const { error } = runInstall((kit) => kit.appendPrefixHandler('probe'));

      assert.notEqual(error, null);
    });

    it('should reject after the workflow finalizes', () => {
      let captured = null;

      runInstall((kit) => {
        captured = kit;
      });

      assert.throws(() => captured.appendPrefixHandler(() => {}));
    });
  });
});
