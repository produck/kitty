import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Kit from '@produck/kit';
import { Implement } from '@produck/kitty-workflow';

import * as Bridge from '../src/Bridge.mjs';

function createWorkflow() {
  const Workflow = Implement.Workflow({
    normalizeHttpResponseBodyData: () => ({ stream: null, length: 0 }),
  });

  return new Workflow(Kit.global);
}

describe('::installSelector()', () => {
  it('should answer a selector', () => {
    const selector = Bridge.installSelector(createWorkflow());

    assert.equal(typeof selector, 'object');
    assert.notEqual(selector, null);
  });

  it('should replace the selector of the same workflow', () => {
    const workflow = createWorkflow();

    assert.notEqual(
      Bridge.installSelector(workflow),
      Bridge.installSelector(workflow),
    );
  });

  it('should keep every workflow apart', () => {
    assert.notEqual(
      Bridge.installSelector(createWorkflow()),
      Bridge.installSelector(createWorkflow()),
    );
  });
});

describe('::getSelector()', () => {
  it('should reject a workflow without a selector', () => {
    assert.throws(() => Bridge.getSelector(createWorkflow()));
  });

  it('should answer the installed selector', () => {
    const workflow = createWorkflow();
    const selector = Bridge.installSelector(workflow);

    assert.equal(Bridge.getSelector(workflow), selector);
  });
});
