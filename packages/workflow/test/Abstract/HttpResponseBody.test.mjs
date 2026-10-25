import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Baseline from '../Baseline/index.mjs';

const passThrough = (value) => ({
  stream: value.stream ?? null,
  length: value.length ?? 0,
});

describe('HttpResponseBody', () => {
  describe('.data', () => {
    it('should report the empty body before any data is set', async () => {
      const state = await Baseline.dispatch();

      assert.deepEqual(state.response.body.data, { stream: null, length: 0 });
    });

    it('should expose the normalized body data', async () => {
      const state = await Baseline.dispatch({ normalize: passThrough });
      const stream = new ReadableStream();

      state.response.body.data = { stream, length: 5 };

      assert.equal(state.response.body.data.stream, stream);
      assert.equal(state.response.body.data.length, 5);
      assert.equal(state.internal.responseBody.stream, stream);
      assert.equal(state.internal.responseBody.length, 5);
    });

    it('should reject a value outside the normalizer result', async () => {
      const state = await Baseline.dispatch({
        normalize: () => {
          throw new Error('probe');
        },
      });

      assert.throws(() => {
        state.response.body.data = { stream: null, length: 0 };
      });
    });
  });
});
