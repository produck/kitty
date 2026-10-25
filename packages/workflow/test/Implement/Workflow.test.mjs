import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Abstract, SYMBOL } from '@produck/kitty-workflow';

import * as Baseline from '../Baseline/index.mjs';

const normalizeHttpResponseBodyData = (value) => ({
  stream: value.stream ?? null,
  length: value.length ?? 0,
});

describe('Workflow()', () => {
  describe('contract', () => {
    it('should require the normalize option', () => {
      assert.throws(() => Baseline.Kitty.Implement.Workflow({}));
    });

    it('should reject options that are not a plain object', () => {
      assert.throws(() => Baseline.Kitty.Implement.Workflow('probe'));
    });

    it('should reject a normalize option outside the function contract', () => {
      assert.throws(() =>
        Baseline.Kitty.Implement.Workflow({
          normalizeHttpResponseBodyData: 1,
        }),
      );
    });
  });

  describe('>instance', () => {
    it('should derive from the workflow abstraction', () => {
      const Workflow = Baseline.Kitty.Implement.Workflow({
        normalizeHttpResponseBodyData,
      });

      assert.equal(typeof Workflow, 'function');
      assert.ok(Workflow.prototype instanceof Abstract.Workflow);
    });

    it('should build an instance from an external kit', () => {
      const Workflow = Baseline.Kitty.Implement.Workflow({
        normalizeHttpResponseBodyData,
      });
      const workflow = new Workflow(Baseline.Kit.global);

      assert.equal(workflow.isFinalized, false);
      assert.equal(typeof workflow.use, 'function');
    });
  });

  describe('>normalize', () => {
    it('should delegate every call to the supplied option', async () => {
      const seen = [];
      const state = await Baseline.dispatch({
        normalize: (value) => {
          seen.push(value);

          return { stream: null, length: 0 };
        },
      });

      state.response.body.data = { stream: null, length: 1 };

      assert.equal(seen.length, 1);
      assert.deepEqual(seen[0], { stream: null, length: 1 });
    });

    it('should implement the abstract normalize slot', () => {
      const seen = [];
      const Workflow = Baseline.Kitty.Implement.Workflow({
        normalizeHttpResponseBodyData: (value) => {
          seen.push(value);

          return { stream: null, length: 0 };
        },
      });
      const workflow = new Workflow(Baseline.Kit.global);
      const result = workflow[
        SYMBOL.WORKFLOW._I.NORMALIZE_HTTP_RESPONSE_BODY_DATA
      ]({ stream: null, length: 2 });

      assert.equal(seen.length, 1);
      assert.deepEqual(seen[0], { stream: null, length: 2 });
      assert.deepEqual(result, { stream: null, length: 0 });
    });
  });
});
