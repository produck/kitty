import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Kit from '@produck/kit';
import { Implement } from '@produck/kitty-workflow';

import {
  Plugin,
  deleteItem,
  registerItem,
  useTypeTable,
} from '@produck/kitty-plugin-mime-type';

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

function createType() {
  const workflow = createWorkflow();

  workflow.withPlugin(Plugin);

  return { workflow, type: useTypeTable(createPluginKit(workflow)) };
}

describe('::useTypeTable()', () => {
  it('should reject a kit without a workflow', () => {
    assert.throws(() => useTypeTable(Kit.global));
  });

  it('should reject a workflow without the plugin', () => {
    const workflow = createWorkflow();

    assert.throws(() => useTypeTable(createPluginKit(workflow)));
  });

  it('should read the registry of the workflow behind the kit', () => {
    const { type } = createType();

    assert.deepEqual(type.findByAlias('json'), [
      { alias: 'json', mimeType: 'application/json' },
    ]);
    assert.deepEqual(type.findByMimeType('application/json'), [
      { alias: 'json', mimeType: 'application/json' },
    ]);
  });

  it('should follow the registry mutations of the workflow', () => {
    const { workflow, type } = createType();
    const item = { alias: 'foo', mimeType: 'application/x-foo' };

    registerItem(workflow, item);

    assert.equal(type.findByAlias('foo').length, 1);

    deleteItem(workflow, item);

    assert.deepEqual(type.findByAlias('foo'), []);
  });

  it('should answer an empty list for an unknown alias', () => {
    const { type } = createType();

    assert.deepEqual(type.findByAlias('unknown'), []);
  });
});
