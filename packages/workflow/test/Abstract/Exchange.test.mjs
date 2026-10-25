import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Baseline from '../Baseline/index.mjs';

describe('Exchange', () => {
  describe('construction', () => {
    it('should reject a deployment kit that is not a kit', () => {
      assert.throws(
        () => new Baseline.HttpExchange({}, null, { internal: {} }),
      );
    });
  });

  describe('.method', () => {
    it('should forward the request method', async () => {
      const state = await Baseline.dispatch({ internal: { method: 'POST' } });

      assert.equal(state.exchange.method, 'POST');
    });
  });

  describe('.url', () => {
    it('should forward the request url', async () => {
      const state = await Baseline.dispatch({
        internal: { url: 'http://baseline.test/probe?x=1' },
      });

      assert.equal(state.exchange.url.href, 'http://baseline.test/probe?x=1');
    });
  });

  describe('.statusCode', () => {
    it('should forward the response status code', async () => {
      const state = await Baseline.dispatch({
        internal: { status: 418, statusText: 'I\'m a Teapot' },
      });

      assert.equal(state.exchange.statusCode, 418);
    });
  });

  describe('.statusText', () => {
    it('should forward the response status text', async () => {
      const state = await Baseline.dispatch({
        internal: { statusText: 'Created' },
      });

      assert.equal(state.exchange.statusText, 'Created');
    });
  });

  describe('.setStatus()', () => {
    it('should forward the status to the response', async () => {
      const state = await Baseline.dispatch();

      state.exchange.setStatus(201, 'Created');

      assert.equal(state.internal.status, 201);
      assert.equal(state.internal.statusText, 'Created');
    });
  });

  describe('.request', () => {
    it('should expose the request part', async () => {
      const state = await Baseline.dispatch();

      assert.equal(state.exchange.request, state.request);
    });
  });

  describe('.response', () => {
    it('should expose the response part', async () => {
      const state = await Baseline.dispatch();

      assert.equal(state.exchange.response, state.response);
    });
  });

  describe('.workflow', () => {
    it('should expose the workflow of the deployment', async () => {
      const state = await Baseline.dispatch();

      assert.equal(state.exchange.workflow, state.workflow);
    });
  });

  describe('.server', () => {
    it('should read the server from the internal record', async () => {
      const state = await Baseline.dispatch();

      assert.equal(state.exchange.server, state.server);
    });
  });

  describe('.protocol', () => {
    it('should read the server protocol from the internal record', async () => {
      const state = await Baseline.dispatch({
        internal: { protocol: 'https:' },
      });

      assert.equal(state.exchange.protocol, 'https:');
    });

    it('should reject a protocol outside the server protocols', async () => {
      const state = await Baseline.dispatch({
        internal: { protocol: 'ftp:' },
      });

      assert.throws(() => state.exchange.protocol);
    });
  });

  describe('.mode', () => {
    it('should read the exchange mode from the internal record', async () => {
      const state = await Baseline.dispatch();

      assert.equal(state.exchange.mode, 'http');
    });
  });

  describe('.httpVersion', () => {
    it('should read the http version from the internal record', async () => {
      const state = await Baseline.dispatch({
        internal: { httpVersion: '2.0' },
      });

      assert.equal(state.exchange.httpVersion, '2.0');
    });

    it('should read an absent http version as null', async () => {
      const state = await Baseline.dispatch({
        internal: { httpVersion: null },
      });

      assert.equal(state.exchange.httpVersion, null);
    });

    it('should reject a http version outside the known versions', async () => {
      const state = await Baseline.dispatch({
        internal: { httpVersion: '9.9' },
      });

      assert.throws(() => state.exchange.httpVersion);
    });
  });

  describe('.toJSON()', () => {
    it('should reject serialization', async () => {
      const state = await Baseline.dispatch();

      assert.throws(() => JSON.stringify(state.exchange));
    });
  });

  describe('>dispatch', () => {
    it('should reject a repeated identity', async () => {
      const fixture = Baseline.createDeployer();
      const workflow = Baseline.createWorkflow();

      Baseline.Kitty.Tune.MaxExchangeTimeout(workflow, 50);
      workflow.finalize();

      await workflow.deploy(new fixture.Server());

      const kit = fixture.installLog[0];
      const internal = Baseline.createInternal();

      await kit.handleHttpExchange(internal);

      await assert.rejects(() => kit.handleHttpExchange(internal));
    });

    it('should accept distinct identities', async () => {
      const fixture = Baseline.createDeployer();
      const workflow = Baseline.createWorkflow();

      Baseline.Kitty.Tune.MaxExchangeTimeout(workflow, 50);
      workflow.finalize();

      await workflow.deploy(new fixture.Server());

      const kit = fixture.installLog[0];

      await kit.handleHttpExchange(Baseline.createInternal());
      await kit.handleHttpExchange(Baseline.createInternal());
    });
  });

  describe('#done', () => {
    it('should dispatch after the pipeline resolves', async () => {
      const state = await Baseline.dispatch();

      assert.deepEqual(Baseline.pipelineEvents(state), ['done', 'finish']);
    });
  });

  describe('#error', () => {
    it('should dispatch with the pipeline error', async () => {
      const state = await Baseline.dispatch({
        handler: () => {
          throw new Error('probe');
        },
      });

      assert.equal(state.installError.message, 'probe');
      assert.deepEqual(Baseline.pipelineEvents(state), ['error', 'finish']);
      assert.equal(state.events[0].detail.error.message, 'probe');
    });
  });

  describe('#finish', () => {
    it('should dispatch once after done or error', async () => {
      const state = await Baseline.dispatch();

      assert.equal(
        Baseline.pipelineEvents(state).filter((n) => n === 'finish').length,
        1,
      );
    });

    it('should dispatch even when the pipeline throws', async () => {
      const state = await Baseline.dispatch({
        handler: () => {
          throw new Error('probe');
        },
      });

      assert.equal(Baseline.pipelineEvents(state).at(-1), 'finish');
    });
  });
});
