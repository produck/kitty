import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import * as Kit from '@produck/kit';

import { $I, _I } from '../src/Symbol.mjs';
import AbstractWorkflow, { useWorkflow } from '../src/Abstract.mjs';

describe('::Workflow', () => {
  describe('::useWorkflow()', () => {
    it('should expose workflow identity through downstream kits.', () => {
      class Workflow extends AbstractWorkflow {
        get kit() {
          return this[$I.KIT];
        }
      }

      const workflow = new Workflow(Kit.global);
      const childKit = workflow.kit('Kitty<Test>');

      assert.equal(useWorkflow(childKit), workflow);
    });
  });

  describe('::attachment surface', () => {
    class AbstractTestWorkflow extends AbstractWorkflow {
      get kit() {
        return this[$I.KIT];
      }

      [_I.COMPOSE.EXTEND]() {}
    }

    it('should attach Workflow dependencies through WorkflowKit.', () => {
      const key = Symbol('workflow dependency');
      const workflow = new AbstractTestWorkflow(Kit.global);
      const childKit = workflow.kit('Kitty<Test>');

      workflow.kit.attachWorkflow(key, 'value');

      assert.equal(childKit[key], 'value');
    });

    it('should reject attachment after finalization.', () => {
      const workflow = new AbstractTestWorkflow(Kit.global);

      workflow.finalize();

      assert.equal(Object.isFrozen(workflow), true);
      assert.throws(() => {
        workflow.kit.attachWorkflow(Symbol('late dependency'), 'value');
      });
    });
  });
});
