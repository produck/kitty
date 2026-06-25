import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import * as Kit from '@produck/kit';

import { $I } from '../src/Symbol.mjs';
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
});
