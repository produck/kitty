import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import * as Kit from '@produck/kit';
import { ThrowTypeError } from '@produck/type-error';

import { $I, _I } from '../src/Symbol.mjs';
import AbstractWorkflow, { useWorkflow } from '../src/Abstract.mjs';

function createTestMixinKit(WorkflowKit, workflow) {
  const MixinKit = WorkflowKit('Kitty<Mixin>');

  MixinKit.attachWorkflow = (name, value) => {
    workflow[$I.ASSERT.NOT_FINALIZED]();

    if (typeof name !== 'string' && typeof name !== 'symbol') {
      ThrowTypeError('args[0] as dependency name', 'string | symbol');
    }

    WorkflowKit[name] = value;
  };

  return MixinKit;
}

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
    class TestAbstractWorkflow extends AbstractWorkflow {
      get kit() {
        return this[$I.KIT];
      }

      [_I.COMPOSE.EXTEND]() {}

      mixin(installer) {
        if (installer !== undefined && typeof installer !== 'function') {
          ThrowTypeError('args[0] as installer', 'function');
        }

        const MixinKit = createTestMixinKit(this[$I.KIT], this);

        if (installer !== undefined) {
          installer(MixinKit);
        }
      }
    }

    it('should attach Workflow dependencies through MixinKit.', () => {
      const key = Symbol('workflow dependency');
      const workflow = new TestAbstractWorkflow(Kit.global);
      const childKit = workflow.kit('Kitty<Test>');

      workflow.mixin((MixinKit) => {
        MixinKit.attachWorkflow(key, 'value');
      });

      assert.equal(childKit[key], 'value');
    });

    it('should reject attachment after finalization.', () => {
      const workflow = new TestAbstractWorkflow(Kit.global);

      workflow.finalize();

      assert.equal(Object.isFrozen(workflow), true);
      assert.throws(() => {
        workflow.mixin((MixinKit) => {
          MixinKit.attachWorkflow(Symbol('late dependency'), 'value');
        });
      });
    });
  });
});
