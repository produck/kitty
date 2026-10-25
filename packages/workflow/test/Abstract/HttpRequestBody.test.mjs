import { Readable } from 'node:stream';

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Fugue from '@produck/fugue';

import * as Baseline from '../Baseline/index.mjs';

const BODY_TYPES = [
  'http-request-body-data-end',
  'http-request-body-data-close',
  'http-request-body-data-error',
  'http-request-body-data-limit',
];

function recordBodyEvents(state) {
  for (const type of BODY_TYPES) {
    state.request.body.addEventListener(type, (event) =>
      state.events.push({ type, detail: event.detail }),
    );
  }
}

class OpenSource extends Readable {
  _read() {
    if (this.pushed === true) {
      return;
    }

    this.pushed = true;
    this.push(Buffer.from('abcd'));
  }
}

class FailingSource extends Readable {
  _read() {
    this.destroy(new Error('probe'));
  }
}

async function drain(reader) {
  const chunks = [];

  try {
    for await (const chunk of reader) {
      chunks.push(chunk);
    }
  } catch {
    chunks.push(null);
  }

  await new Promise((resolve) => setTimeout(resolve, 20));

  return chunks;
}

function bodyEvents(state) {
  return state.events
    .filter(({ type }) => type.startsWith('http-request-body-data-'))
    .map(({ type }) => type.replace('http-request-body-data-', ''));
}

describe('HttpRequestBody', () => {
  describe('.data', () => {
    it('should fork a reader from the distributor', async () => {
      const state = await Baseline.dispatch({ internal: { method: 'POST' } });
      const reader = state.request.body.data;

      assert.equal(typeof reader, 'object');
      assert.equal(typeof reader[Symbol.asyncIterator], 'function');
    });

    it('should give every reader an independent progress', async () => {
      const state = await Baseline.dispatch({ internal: { method: 'POST' } });

      assert.notEqual(state.request.body.data, state.request.body.data);
    });
  });

  describe('.distributor', () => {
    it('should expose the distributor of the exchange', async () => {
      const state = await Baseline.dispatch({ internal: { method: 'POST' } });

      assert.equal(typeof state.request.body.distributor, 'object');
      assert.equal(typeof state.request.body.distributor.fork, 'function');
    });
  });

  describe('#end', () => {
    it('should dispatch when the source ends', async () => {
      const state = await Baseline.dispatch({
        internal: { method: 'POST', body: Readable.from([Buffer.from('ab')]) },
        setup: recordBodyEvents,
      });

      await drain(state.request.body.data);

      assert.ok(bodyEvents(state).includes('end'));
    });
  });

  describe('#close', () => {
    it('should dispatch when the source closes', async () => {
      const state = await Baseline.dispatch({
        internal: { method: 'POST', body: Readable.from([Buffer.from('ab')]) },
        setup: recordBodyEvents,
      });

      await drain(state.request.body.data);

      assert.ok(bodyEvents(state).includes('close'));
    });
  });

  describe('#error', () => {
    it('should dispatch with the source error', async () => {
      const state = await Baseline.dispatch({
        internal: { method: 'POST', body: new FailingSource() },
        setup: recordBodyEvents,
      });

      await drain(state.request.body.data);

      const error = state.events.find(
        ({ type }) => type === 'http-request-body-data-error',
      );

      assert.equal(error.detail.error.message, 'probe');
    });
  });

  describe('#limit', () => {
    it('should dispatch when the size limit is consumed', async () => {
      const state = await Baseline.dispatch({
        internal: { method: 'POST', body: new OpenSource() },
        config: { MaxBodySize: 1 },
        setup: recordBodyEvents,
      });

      await drain(state.request.body.data);

      assert.ok(bodyEvents(state).includes('limit'));
    });
  });

  describe('>limit', () => {
    it('should destroy the distributor', async () => {
      const state = await Baseline.dispatch({
        internal: { method: 'POST', body: new OpenSource() },
        config: { MaxBodySize: 1 },
        setup: recordBodyEvents,
      });

      const chunks = await drain(state.request.body.data);

      assert.deepEqual(chunks, [null]);
    });

    it('should set the status to 413', async () => {
      const state = await Baseline.dispatch({
        internal: { method: 'POST', body: new OpenSource() },
        config: { MaxBodySize: 1 },
        setup: recordBodyEvents,
      });

      await drain(state.request.body.data);

      assert.equal(state.internal.status, 413);
    });
  });

  describe('>metric', () => {
    it('should ignore a metric outside the source consumption code', async () => {
      const state = await Baseline.dispatch({
        internal: { method: 'POST', body: new OpenSource() },
        config: { MaxBodySize: 1 },
        setup: recordBodyEvents,
      });
      const { distributor } = state.request.body;

      distributor.dispatchEvent(new Fugue.Event.Metric('probe-metric', 1024));

      assert.deepEqual(bodyEvents(state), []);
      assert.equal(distributor.terminated, false);
      assert.equal(state.internal.status, 200);
    });
  });
});
