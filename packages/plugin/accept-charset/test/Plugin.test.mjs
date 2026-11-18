import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Kit from '@produck/kit';
import { Implement } from '@produck/kitty-workflow';
import { Plugin as CharsetPlugin } from '@produck/kitty-plugin-charset';

import { Plugin } from '@produck/kitty-plugin-accept-charset';

function createWorkflow() {
  const Workflow = Implement.Workflow({
    normalizeHttpResponseBodyData: () => ({ stream: null, length: 0 }),
  });

  return new Workflow(Kit.global);
}

describe('::Plugin', () => {
  it('should reject a workflow without the charset plugin', () => {
    const workflow = createWorkflow();

    assert.throws(() => workflow.mountPlugin(Plugin), {
      message: /charset selector is NOT installed/,
    });
  });

  it('should install over the charset plugin', () => {
    const workflow = createWorkflow();

    workflow.mountPlugin(CharsetPlugin);
    workflow.mountPlugin(Plugin);

    assert.doesNotThrow(() => workflow.finalize());
  });
});
