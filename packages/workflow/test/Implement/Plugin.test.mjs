import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Abstract, SYMBOL } from '@produck/kitty-workflow';

import * as Baseline from '../Baseline/index.mjs';

describe('Plugin()', () => {
  describe('contract', () => {
    it('should reject options that are not a plain object', () => {
      assert.throws(() => Baseline.Kitty.Implement.Plugin('probe'));
    });
    it('should require the tag option', () => {
      assert.throws(() =>
        Baseline.Kitty.Implement.Plugin({ tag: undefined, install: () => {} }),
      );
    });

    it('should require the install option', () => {
      assert.throws(() => Baseline.Kitty.Implement.Plugin({ tag: 'probe' }));
    });
  });

  describe('>class', () => {
    it('should derive from the plugin abstraction', () => {
      const Plugin = Baseline.Kitty.Implement.Plugin({
        tag: 'probe',
        install: () => {},
      });

      assert.ok(Plugin.prototype instanceof Abstract.Plugin);
    });

    it('should expose the tag through both the getter and the slot', () => {
      const Plugin = Baseline.Kitty.Implement.Plugin({
        tag: 'probe',
        install: () => {},
      });

      assert.equal(Plugin.tag, 'probe');
      assert.equal(Plugin[SYMBOL.PLUGIN._S.TAG], 'probe');
    });
  });

  describe('>install', () => {
    it('should call the supplied install option with the plugin kit', () => {
      const seen = [];
      const workflow = Baseline.createWorkflow();
      const Plugin = Baseline.Kitty.Implement.Plugin({
        tag: 'probe',
        install: (kit) => seen.push(kit),
      });

      workflow.mixin(Plugin);
      workflow.finalize();

      assert.equal(seen.length, 1);
      assert.equal(typeof seen[0].appendPrefixHandler, 'function');
    });
  });
});
