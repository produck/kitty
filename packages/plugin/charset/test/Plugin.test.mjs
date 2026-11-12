import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Kit from '@produck/kit';
import { Implement } from '@produck/kitty-workflow';

import * as Bridge from '../src/Bridge.mjs';
import { Plugin } from '../src/index.mjs';

function createWorkflow() {
  const Workflow = Implement.Workflow({
    normalizeHttpResponseBodyData: () => ({ stream: null, length: 0 }),
  });

  return new Workflow(Kit.global);
}

describe('::Plugin', () => {
  it('should install a selector on the workflow', () => {
    const workflow = createWorkflow();

    workflow.withPlugin(Plugin);

    assert.equal(typeof Bridge.getSelector(workflow), 'object');
  });

  it('should keep every workflow registry apart', () => {
    const left = createWorkflow();
    const right = createWorkflow();

    left.withPlugin(Plugin);
    right.withPlugin(Plugin);

    assert.notEqual(Bridge.getSelector(left), Bridge.getSelector(right));
  });
});
