import * as net from 'node:net';

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Abstract, SYMBOL } from '@produck/kitty-workflow';

import * as Baseline from '../Baseline/index.mjs';

class MinimalServer extends net.Server {}

function createMinimalDeployer() {
  return Baseline.SCP(
    class extends Abstract.Deployer {
      static get [SYMBOL.DEPLOYER._S.TAG]() {
        return 'minimal';
      }

      static get [SYMBOL.DEPLOYER._S.SERVER_CTOR]() {
        return MinimalServer;
      }

      static get [SYMBOL.DEPLOYER._S.EXCHANGE_CTOR.HTTP]() {
        return Baseline.HttpExchange;
      }

      [SYMBOL.DEPLOYER._I.INSTALL]() {}
    },
  );
}

function createInvalidWebSocketDeployer() {
  return Baseline.SCP(
    class extends Abstract.Deployer {
      static get [SYMBOL.DEPLOYER._S.TAG]() {
        return 'invalid-web-socket';
      }

      static get [SYMBOL.DEPLOYER._S.SERVER_CTOR]() {
        return class InvalidServer extends net.Server {};
      }

      static get [SYMBOL.DEPLOYER._S.EXCHANGE_CTOR.HTTP]() {
        return Baseline.HttpExchange;
      }

      static get [SYMBOL.DEPLOYER._S.EXCHANGE_CTOR.WEB_SOCKET]() {
        return 1;
      }

      [SYMBOL.DEPLOYER._I.INSTALL]() {}
    },
  );
}

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
  const { manifest } = await workflow.compile(server);

  return { errors, fixture, manifest, server, workflow };
}

describe('Deployer', () => {
  describe('::tag', () => {
    it('should return the configured tag', () => {
      const { Deployer } = Baseline.createDeployer({ tag: 'probe' });

      assert.equal(Deployer.tag, 'probe');
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

      const { manifest } = await workflow.compile(new fixture.Server());

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

  describe('construction', () => {
    it('should reject a deployment kit that is not a kit', () => {
      const Deployer = createMinimalDeployer();

      assert.throws(() => new Deployer({}, {}));
    });
  });

  describe('::[EXCHANGE_CTOR.WEB_SOCKET]', () => {
    it('should default to undefined', () => {
      const Deployer = createMinimalDeployer();

      assert.equal(
        Deployer[SYMBOL.DEPLOYER._S.EXCHANGE_CTOR.WEB_SOCKET],
        undefined,
      );
    });

    it('should reject a constructor outside the web socket contract', () => {
      const Deployer = createInvalidWebSocketDeployer();

      assert.throws(
        () => Deployer[SYMBOL.DEPLOYER._S.EXCHANGE_CTOR.WEB_SOCKET],
      );
    });
  });
});
