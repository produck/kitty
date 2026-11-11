import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Kit from '@produck/kit';
import { Implement } from '@produck/kitty-workflow';

import * as Bridge from '../src/Bridge.mjs';
import { registerItems } from '../src/index.mjs';
import * as Preset from '../src/Preset.mjs';

function createWorkflow() {
  const Workflow = Implement.Workflow({
    normalizeHttpResponseBodyData: () => ({ stream: null, length: 0 }),
  });
  const workflow = new Workflow(Kit.global);

  Bridge.installTypeTable(workflow);

  return workflow;
}

function toItem(source) {
  return {
    mimeType: source[Preset.MIME_TYPE],
    aliasList: [...source[Preset.ALIAS_LIST]],
    charsetList: [...source[Preset.CHARSET_LIST]],
  };
}

describe('::Web', () => {
  it('should register every entry without a conflict', () => {
    const workflow = createWorkflow();

    registerItems(workflow, Preset.Web.map(toItem));
  });

  it('should key every entry with the preset symbols', () => {
    for (const entry of Preset.Web) {
      assert.equal(typeof entry[Preset.MIME_TYPE], 'string');
      assert.ok(Array.isArray(entry[Preset.ALIAS_LIST]));
      assert.ok(Array.isArray(entry[Preset.CHARSET_LIST]));
    }
  });

  it('should expose only the preset symbols', () => {
    for (const entry of Preset.Web) {
      assert.equal(Object.keys(entry).length, 0);
      assert.equal(Object.getOwnPropertySymbols(entry).length, 3);
    }
  });

  it('should be frozen', () => {
    assert.throws(() => Preset.Web.push({}));
  });
});
