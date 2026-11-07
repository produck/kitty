import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Kit from '@produck/kit';
import { Implement } from '@produck/kitty-workflow';

import { Get, Plugin, Tune } from '@produck/kitty-plugin-cookie';

function createWorkflow() {
  const Workflow = Implement.Workflow({
    normalizeHttpResponseBodyData: () => ({ stream: null, length: 0 }),
  });

  return new Workflow(Kit.global);
}

function createInstalledWorkflow() {
  const workflow = createWorkflow();

  workflow.withPlugin(Plugin);

  return workflow;
}

describe('::Tune', () => {
  it('should reject a workflow without the plugin', () => {
    assert.throws(() => Tune.Domain(createWorkflow(), 'example.com'));
    assert.throws(() => Tune.MaxAge(createWorkflow(), 60));
    assert.throws(() => Tune.Expires(createWorkflow(), new Date()));
  });

  it('should write the workflow defaults', () => {
    const workflow = createInstalledWorkflow();

    Tune.Domain(workflow, 'example.com');
    Tune.MaxAge(workflow, 60);
    Tune.Expires(workflow, new Date(Date.UTC(2020, 0, 1)));

    assert.equal(Get.Domain(workflow), 'example.com');
    assert.equal(Get.MaxAge(workflow), 60);
    assert.equal(
      Get.Expires(workflow).toISOString(),
      '2020-01-01T00:00:00.000Z',
    );
  });

  it('should start every workflow from the absent defaults', () => {
    const workflow = createInstalledWorkflow();

    assert.equal(Get.Domain(workflow), null);
    assert.equal(Get.MaxAge(workflow), null);
    assert.equal(Get.Expires(workflow), null);
  });

  it('should reject a value outside the option contract', () => {
    const workflow = createInstalledWorkflow();

    assert.throws(() => Tune.Domain(workflow, 1));
    assert.throws(() => Tune.Domain(workflow, 'a;b'));
    assert.throws(() => Tune.MaxAge(workflow, 1.5));
    assert.throws(() => Tune.MaxAge(workflow, '60'));
    assert.throws(() => Tune.Expires(workflow, 1));
    assert.throws(() => Tune.Expires(workflow, new Date('x')));
  });

  it('should accept the absent value', () => {
    const workflow = createInstalledWorkflow();

    Tune.Domain(workflow, 'example.com');
    Tune.Domain(workflow, null);

    assert.equal(Get.Domain(workflow), null);
  });
});
