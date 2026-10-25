import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Baseline from './Baseline/index.mjs';

function collectSymbols(value, collected = []) {
  for (const entry of Object.values(value)) {
    if (typeof entry === 'symbol') {
      collected.push(entry);
    } else if (entry !== null && typeof entry === 'object') {
      collectSymbols(entry, collected);
    }
  }

  return collected;
}

describe('SYMBOL', () => {
  describe('::subjects', () => {
    it('should freeze the record', () => {
      assert.ok(Object.isFrozen(Baseline.Kitty.SYMBOL));
    });

    it('should freeze every subject record', () => {
      for (const [subject, phases] of Object.entries(Baseline.Kitty.SYMBOL)) {
        assert.ok(Object.isFrozen(phases), subject);
      }
    });

    it('should expose only the abstract phases', () => {
      for (const [subject, phases] of Object.entries(Baseline.Kitty.SYMBOL)) {
        for (const phase of Object.keys(phases)) {
          assert.ok(['_I', '_S'].includes(phase), `${subject}.${phase}`);
        }
      }
    });

    it('should freeze every phase table', () => {
      for (const [subject, phases] of Object.entries(Baseline.Kitty.SYMBOL)) {
        for (const [phase, table] of Object.entries(phases)) {
          assert.equal(typeof table, 'object', `${subject}.${phase}`);
          assert.ok(Object.isFrozen(table), `${subject}.${phase}`);
        }
      }
    });
  });

  describe('>identity', () => {
    it('should carry a unique symbol per entry', () => {
      const symbols = collectSymbols(Baseline.Kitty.SYMBOL);

      assert.ok(symbols.length > 0);
      assert.equal(new Set(symbols).size, symbols.length);
    });

    it('should describe the owning member', () => {
      for (const symbol of collectSymbols(Baseline.Kitty.SYMBOL)) {
        assert.match(String(symbol), /^Symbol\(\._/);
      }
    });
  });

  describe('::WORKFLOW', () => {
    it('should expose the normalizer slot only', () => {
      assert.deepEqual(Object.keys(Baseline.Kitty.SYMBOL.WORKFLOW), ['_I']);
      assert.deepEqual(Object.keys(Baseline.Kitty.SYMBOL.WORKFLOW._I), [
        'NORMALIZE_HTTP_RESPONSE_BODY_DATA',
      ]);
    });
  });

  describe('::DEPLOYER', () => {
    it('should expose the install slot and the static slots', () => {
      assert.deepEqual(Object.keys(Baseline.Kitty.SYMBOL.DEPLOYER._I), [
        'INSTALL',
      ]);
      assert.deepEqual(Object.keys(Baseline.Kitty.SYMBOL.DEPLOYER._S).sort(), [
        'EXCHANGE_CTOR',
        'SERVER_CTOR',
        'TAG',
      ]);
    });
  });

  describe('::PLUGIN', () => {
    it('should expose the install slot and the tag slot', () => {
      assert.deepEqual(Object.keys(Baseline.Kitty.SYMBOL.PLUGIN._I), [
        'INSTALL',
      ]);
      assert.deepEqual(Object.keys(Baseline.Kitty.SYMBOL.PLUGIN._S), ['TAG']);
    });
  });
});
