import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Kit from '@produck/kit';
import { Implement } from '@produck/kitty-workflow';

import { Plugin } from '@produck/kitty-plugin-mime-type';

import * as Bridge from '../src/Bridge.mjs';
import { findAll } from '../src/index.mjs';
import { CHARSET } from '../src/Preset.mjs';

function createWorkflow() {
  const Workflow = Implement.Workflow({
    normalizeHttpResponseBodyData: () => ({ stream: null, length: 0 }),
  });

  return new Workflow(Kit.global);
}

describe('::Plugin', () => {
  it('should install the standard preset', () => {
    const workflow = createWorkflow();

    workflow.withPlugin(Plugin);

    assert.deepEqual(Bridge.getTypeTable(workflow).findByAlias('json'), [
      {
        mimeType: 'application/json',
        aliasList: ['json'],
        charsetList: CHARSET.EMPTY,
      },
      {
        mimeType: 'text/json',
        aliasList: ['json'],
        charsetList: CHARSET.ANY,
      },
    ]);
    assert.ok(findAll(workflow).length > 0);
  });

  it('should keep every workflow registry apart', () => {
    const left = createWorkflow();
    const right = createWorkflow();

    left.withPlugin(Plugin);

    assert.ok(findAll(left).length > 0);
    assert.throws(() => findAll(right));
  });
});
