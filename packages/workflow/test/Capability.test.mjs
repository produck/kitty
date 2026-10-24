import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Baseline from './Baseline/index.mjs';

describe('capability', () => {
  describe('::useWorkflow()', () => {
    describe('>resolution', () => {
      it('should resolve the workflow from a plugin kit', () => {
        const workflow = Baseline.createWorkflow();
        const captured = [];

        for (const name of ['first', 'second']) {
          workflow.mixin(
            Baseline.Kitty.Implement.Plugin({
              name,
              install: (kit) => captured.push(Baseline.Kitty.useWorkflow(kit)),
            }),
          );
        }

        workflow.finalize();

        assert.equal(captured.length, 2);
        assert.equal(typeof captured[0], 'object');
        assert.equal(captured[0], captured[1]);
      });

      it('should reject a kit without the dependency', () => {
        assert.throws(() => Baseline.Kitty.useWorkflow(Baseline.Kit.global));
      });
    });
  });

  describe('::useServer()', () => {
    describe('>resolution', () => {
      it('should resolve the server from a deployer kit', async () => {
        const captured = [];
        const fixture = Baseline.createDeployer({
          declare: (kit) => captured.push(Baseline.Kitty.useServer(kit)),
        });
        const workflow = Baseline.createWorkflow();
        const server = new fixture.Server();

        workflow.finalize();
        await workflow.compile(server);

        assert.equal(captured.length, 1);
        assert.equal(captured[0], server);
      });
    });

    describe('>failure', () => {
      it('should reject a kit without the dependency', () => {
        assert.throws(() => Baseline.Kitty.useServer(Baseline.Kit.global));
      });
    });
  });

  describe('::accessor identity', () => {
    it('should resolve a capability written one level down', () => {
      const workflow = Baseline.createWorkflow();
      let fromPlugin = null;

      workflow.mixin(
        Baseline.Kitty.Implement.Plugin({
          name: 'probe',
          install: (kit) => {
            fromPlugin = Baseline.Kitty.useWorkflow(kit);
          },
        }),
      );

      assert.equal(typeof fromPlugin, 'object');
    });
  });
});
