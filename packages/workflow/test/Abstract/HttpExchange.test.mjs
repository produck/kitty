import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Baseline from '../Baseline/index.mjs';

describe('HttpExchange', () => {
  describe('.request', () => {
    it('should expose the http request part', async () => {
      const state = await Baseline.dispatch({
        internal: { method: 'POST' },
      });

      assert.equal(state.exchange.request, state.request);
      assert.equal(typeof state.request.body, 'object');
    });
  });

  describe('.response', () => {
    it('should expose the http response part', async () => {
      const state = await Baseline.dispatch();

      assert.equal(state.exchange.response, state.response);
      assert.equal(typeof state.response.body, 'object');
    });
  });

  describe('#timeout', () => {
    it('should dispatch when the response outlives the timeout option', async () => {
      const state = await Baseline.dispatch({
        timeout: 10,
        handler: () => new Promise((resolve) => setTimeout(resolve, 40)),
      });

      assert.ok(Baseline.eventTypes(state).includes('http-exchange-timeout'));
    });

    it('should stop the timer when the pipeline finishes', async () => {
      const state = await Baseline.dispatch({ timeout: 10 });

      await new Promise((resolve) => setTimeout(resolve, 30));

      assert.deepEqual(Baseline.eventTypes(state), [
        'exchange-pipeline-done',
        'exchange-pipeline-finish',
      ]);
    });
  });

  describe('>status', () => {
    it('should set the status to 503 before dispatching the timeout', async () => {
      const state = await Baseline.dispatch({
        timeout: 10,
        handler: () => new Promise((resolve) => setTimeout(resolve, 40)),
      });

      assert.equal(state.internal.status, 503);
    });
  });
});
