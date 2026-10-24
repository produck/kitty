import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Baseline from '../Baseline/index.mjs';

async function run(hook) {
  const errors = [];
  const fixture = Baseline.createDeployer({
    install: (kit) => {
      try {
        hook(kit);
      } catch (error) {
        errors.push(error);
      }
    },
  });
  const workflow = Baseline.createWorkflow();

  workflow.finalize();

  const server = new fixture.Server();
  const manifest = await workflow.compile(server);

  return { errors, fixture, manifest, server, workflow };
}

describe('Deployer', () => {
  describe('::name', () => {
    it('should return the configured name', () => {
      const { Deployer } = Baseline.createDeployer({ name: 'probe' });

      assert.equal(Deployer.name, 'probe');
    });
  });

  describe('.declare()', () => {
    it('should write a named entry into the manifest', async () => {
      const fixture = Baseline.createDeployer({
        declare: (kit) => {
          kit.declare('request', () => {});
          kit.declare('options', { timeout: 1 });
        },
      });
      const workflow = Baseline.createWorkflow();

      workflow.finalize();

      const manifest = await workflow.compile(new fixture.Server());

      assert.deepEqual(Object.keys(manifest).sort(), ['options', 'request']);
      assert.deepEqual(manifest.options, { timeout: 1 });
    });

    it('should reject a non-string name', async () => {
      const { errors } = await run((kit) => kit.declare(1, 'probe'));

      assert.equal(errors.length, 1);
    });
  });

  describe('.setServerLinker()', () => {
    it('should register a linker for the link phase', async () => {
      const fixture = Baseline.createDeployer({ linkers: ['only'] });
      const workflow = Baseline.createWorkflow();

      workflow.finalize();

      await workflow.deploy(new fixture.Server());

      assert.deepEqual(fixture.linkLog, ['only']);
    });

    it('should reject a non-function linker', async () => {
      const { errors } = await run((kit) => kit.setServerLinker('probe'));

      assert.equal(errors.length, 1);
    });
  });

  describe('.appendExchangeAttacher()', () => {
    it('should register an attacher for every exchange', async () => {
      const attached = [];
      const state = await Baseline.dispatch({
        deployer: {
          install: (kit) => {
            kit.appendExchangeAttacher((ExchangeKit) =>
              attached.push(ExchangeKit),
            );
          },
        },
      });

      assert.equal(attached.length, 1);
      assert.equal(attached[0], state.exchangeKit);
    });

    it('should reject a non-function attacher', async () => {
      const { errors } = await run((kit) =>
        kit.appendExchangeAttacher('probe'),
      );

      assert.equal(errors.length, 1);
    });
  });

  describe('.attachDeployment()', () => {
    it('should attach a value to the deployment kit', async () => {
      const { errors } = await run((kit) => kit.attachDeployment('probe', 1));

      assert.deepEqual(errors, []);
    });

    it('should reject a non-string key', async () => {
      const { errors } = await run((kit) => kit.attachDeployment(1, 'probe'));

      assert.equal(errors.length, 1);
    });
  });

  describe('.handleHttpExchange()', () => {
    it('should dispatch the http exchange class with the internal record', async () => {
      const state = await Baseline.dispatch();

      assert.equal(state.exchange.constructor.name, 'HttpExchange');
      assert.deepEqual(Baseline.pipelineEvents(state), ['done', 'finish']);
    });
  });

  describe('.handleWebSocketExchange()', () => {
    it('should dispatch the web socket exchange class', async () => {
      const state = await Baseline.dispatch({
        kind: 'websocket',
        internal: { socket: { readyState: 1, sent: [], closed: null } },
      });

      assert.equal(state.exchange.constructor.name, 'WebSocketExchange');
      assert.equal(state.exchange.mode, 'websocket');
    });

    it('should reject when the web socket slot is absent', async () => {
      const fixture = Baseline.createDeployer();
      const workflow = Baseline.createWorkflow();

      workflow.finalize();

      await workflow.deploy(new fixture.Server());

      const kit = fixture.installLog[0];

      await assert.rejects(() => kit.handleWebSocketExchange({}));
    });
  });

  describe('>commit gate', () => {
    it('should reject every port after the deployment commits', async () => {
      let captured = null;
      const fixture = Baseline.createDeployer({
        install: (kit) => {
          captured = kit;
        },
      });
      const workflow = Baseline.createWorkflow();

      workflow.finalize();

      await workflow.compile(new fixture.Server());

      assert.throws(() => captured.declare('late', 1));
      assert.throws(() => captured.setServerLinker(() => {}));
      assert.throws(() => captured.appendExchangeAttacher(() => {}));
      assert.throws(() => captured.attachDeployment('late', 1));
    });
  });
});
