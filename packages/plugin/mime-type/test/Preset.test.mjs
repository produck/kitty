import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Kit from '@produck/kit';
import { Implement } from '@produck/kitty-workflow';

import {
  Document,
  Media,
  Standard,
  Web,
} from '@produck/kitty-plugin-mime-type';

import * as Bridge from '../src/Bridge.mjs';
import { registerItems } from '../src/index.mjs';

const PRESET_LIST = [
  ['Standard', Standard],
  ['Web', Web],
  ['Media', Media],
  ['Document', Document],
];

function createWorkflow() {
  const Workflow = Implement.Workflow({
    normalizeHttpResponseBodyData: () => ({ stream: null, length: 0 }),
  });
  const workflow = new Workflow(Kit.global);

  Bridge.installTypeTable(workflow);

  return workflow;
}

describe('::Preset', () => {
  for (const [name, preset] of PRESET_LIST) {
    it(`should register every ${name} item without a conflict`, () => {
      const workflow = createWorkflow();

      registerItems(workflow, preset);

      assert.equal(
        new Set(preset.map(({ mimeType }) => mimeType)).size > 0,
        true,
      );
      assert.equal(
        preset.every(({ alias }) => typeof alias === 'string'),
        true,
      );
    });
  }

  it('should register every preset together', () => {
    const workflow = createWorkflow();

    registerItems(workflow, [...Standard, ...Web, ...Media, ...Document]);

    assert.ok(Standard.length > 0);
  });
});
