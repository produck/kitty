import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Kit from '@produck/kit';
import { Implement } from '@produck/kitty-workflow';

import { Plugin } from '@produck/kitty-plugin-forwarded';

function createWorkflow() {
  const Workflow = Implement.Workflow({
    normalizeHttpResponseBodyData: () => ({ stream: null, length: 0 }),
  });

  return new Workflow(Kit.global);
}

describe('::Plugin', () => {
  it('should install on a workflow', () => {
    const workflow = createWorkflow();

    workflow.mountPlugin(Plugin);

    assert.doesNotThrow(() => workflow.finalize());
  });
});
