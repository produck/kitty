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

    it('should reject a normalizer result that is not a record', async () => {
      const state = await Baseline.dispatch({ normalize: () => 'probe' });

      assert.throws(() => {
        state.response.body.data = { stream: null, length: 0 };
      });
    });

    it('should reject a null stream with a non-zero length', async () => {
      const state = await Baseline.dispatch({
        normalize: () => ({ stream: null, length: 1 }),
      });

      assert.throws(() => {
        state.response.body.data = { stream: null, length: 0 };
      });
    });

    it('should reject a stream that is not a ReadableStream', async () => {
      const state = await Baseline.dispatch({
        normalize: () => ({ stream: 'probe', length: 0 }),
      });

      assert.throws(() => {
        state.response.body.data = { stream: null, length: 0 };
      });
    });

    it('should reject a locked stream', async () => {
      const stream = new ReadableStream();

      stream.getReader();

      const state = await Baseline.dispatch({
        normalize: () => ({ stream, length: 0 }),
      });

      assert.throws(() => {
        state.response.body.data = { stream: null, length: 0 };
      });
    });

    it('should reject a negative stream length', async () => {
      const state = await Baseline.dispatch({
        normalize: () => ({ stream: new ReadableStream(), length: -1 }),
      });

      assert.throws(() => {
        state.response.body.data = { stream: null, length: 0 };
      });
    });

    it('should reject a stream length that is not an integer', async () => {
      const state = await Baseline.dispatch({
        normalize: () => ({ stream: new ReadableStream(), length: 1.5 }),
      });

      assert.throws(() => {
        state.response.body.data = { stream: null, length: 0 };
      });
    });
  });
});
