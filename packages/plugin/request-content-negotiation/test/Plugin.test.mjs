import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Kit from '@produck/kit';
import { Implement } from '@produck/kitty-workflow';
import { Plugin as MimeTypePlugin } from '@produck/kitty-plugin-mime-type';

import { Plugin } from '@produck/kitty-plugin-request-content-negotiation';

function createWorkflow() {
  const Workflow = Implement.Workflow({
    normalizeHttpResponseBodyData: () => ({ stream: null, length: 0 }),
  });

  return new Workflow(Kit.global);
}

describe('::Plugin', () => {
  it('should reject a workflow without the mime type plugin', () => {
    const workflow = createWorkflow();

    assert.throws(() => workflow.withPlugin(Plugin), {
      message: /mime type table is NOT installed/,
    });
  });

  it('should install over the mime type plugin', () => {
    const workflow = createWorkflow();

    workflow.withPlugin(MimeTypePlugin);
    workflow.withPlugin(Plugin);

    assert.doesNotThrow(() => workflow.finalize());
  });
});
