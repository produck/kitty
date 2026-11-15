import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Kit from '@produck/kit';
import { Implement } from '@produck/kitty-workflow';
import { Plugin as MimeTypePlugin } from '@produck/kitty-plugin-mime-type';

import {
  Plugin,
  useResponseContentTypeAccessor,
  useResponseType,
} from '@produck/kitty-plugin-response-type';

function createWorkflow() {
  const Workflow = Implement.Workflow({
    normalizeHttpResponseBodyData: () => ({ stream: null, length: 0 }),
  });

  return new Workflow(Kit.global);
}

describe('::useResponseType()', () => {
  it('should reject a kit without a workflow', () => {
    assert.throws(() => useResponseType(Kit.global));
  });

  it('should answer the same accessor as the long name', () => {
    assert.equal(useResponseType, useResponseContentTypeAccessor);
  });
});

describe('::Plugin', () => {
  it('should require the mime type table', () => {
    const workflow = createWorkflow();

    assert.throws(
      () => workflow.withPlugin(Plugin),
      /mime type table is NOT installed/,
    );
  });

  it('should require the charset selector', () => {
    const workflow = createWorkflow();

    workflow.withPlugin(MimeTypePlugin);

    assert.throws(
      () => workflow.withPlugin(Plugin),
      /charset selector is NOT installed/,
    );
  });
});
