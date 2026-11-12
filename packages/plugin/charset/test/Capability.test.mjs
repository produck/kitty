import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Kit from '@produck/kit';
import { Implement } from '@produck/kitty-workflow';

import { Plugin, Record, useCharset } from '@produck/kitty-plugin-charset';

function createWorkflow() {
  const Workflow = Implement.Workflow({
    normalizeHttpResponseBodyData: () => ({ stream: null, length: 0 }),
  });

  return new Workflow(Kit.global);
}

function createPluginKit(workflow) {
  let kit = null;

  workflow.withPlugin(
    Implement.Plugin({
      tag: 'probe',
      install: (PluginKit) => (kit = PluginKit),
    }),
  );

  return kit;
}

function createSelector() {
  const workflow = createWorkflow();

  workflow.withPlugin(Plugin);

  return { workflow, selector: useCharset(createPluginKit(workflow)) };
}

const UTF_8 = {
  name: 'kitty-utf-8',
  mibEnum: 9999,
  preferredName: 'kitty-utf-8',
  aliasList: ['kitty-utf-8', 'KITTY-UTF-8'],
};

describe('::useCharset()', () => {
  it('should reject a kit without a workflow', () => {
    assert.throws(() => useCharset(Kit.global));
  });

  it('should reject a workflow without the plugin', () => {
    const workflow = createWorkflow();

    assert.throws(() => useCharset(createPluginKit(workflow)));
  });

  it('should answer the selector of the workflow behind the kit', () => {
    const { selector } = createSelector();

    assert.equal(typeof selector, 'object');
    assert.notEqual(selector, null);
  });

  it('should follow the registration of the workflow', () => {
    const { workflow, selector } = createSelector();

    Record.register(workflow, UTF_8);

    assert.deepEqual(selector.findByName('kitty-utf-8'), {
      name: 'kitty-utf-8',
      mibEnum: 9999,
      preferredName: 'kitty-utf-8',
      aliasList: ['kitty-utf-8'],
    });
  });

  it('should keep every workflow registry apart', () => {
    const left = createSelector();
    const right = createSelector();

    Record.register(left.workflow, UTF_8);

    assert.notEqual(left.selector.findByName('kitty-utf-8'), null);
    assert.equal(right.selector.findByName('kitty-utf-8'), null);
  });
});
