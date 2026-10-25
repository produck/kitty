import * as net from 'node:net';

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Abstract, SYMBOL } from '@produck/kitty-workflow';

import * as Baseline from '../Baseline/index.mjs';

const HTTP_EXCHANGE = Baseline.HttpExchange;

function createOptions(patch = {}) {
  const options = {
    tag: 'probe',
    server: class ProbeServer extends net.Server {},
    exchange: { http: HTTP_EXCHANGE },
    install: () => {},
    ...patch,
  };

  return options;
}

describe('Deployer()', () => {
  describe('contract', () => {
    it('should reject options that are not a plain object', () => {
      assert.throws(() => Baseline.Kitty.Implement.Deployer('probe'));
    });

    it('should require the tag option', () => {
      assert.throws(() =>
        Baseline.Kitty.Implement.Deployer(createOptions({ tag: undefined })),
      );
    });

    it('should require the server option', () => {
      assert.throws(() =>
        Baseline.Kitty.Implement.Deployer(createOptions({ server: undefined })),
      );
    });

    it('should require the http exchange option', () => {
      assert.throws(() =>
        Baseline.Kitty.Implement.Deployer(createOptions({ exchange: {} })),
      );
    });

    it('should require the install option', () => {
      assert.throws(() =>
        Baseline.Kitty.Implement.Deployer(
          createOptions({ install: undefined }),
        ),
      );
    });

    it('should reject an exchange record that is not a plain object', () => {
      assert.throws(() =>
        Baseline.Kitty.Implement.Deployer(createOptions({ exchange: null })),
      );
    });

    it('should reject a web socket exchange outside the contract', () => {
      assert.throws(() =>
        Baseline.Kitty.Implement.Deployer(
          createOptions({ exchange: { http: HTTP_EXCHANGE, webSocket: 1 } }),
        ),
      );
    });
  });

  describe('>class', () => {
    it('should derive from the deployer abstraction', () => {
      const Deployer = Baseline.Kitty.Implement.Deployer(createOptions());

      assert.ok(Deployer.prototype instanceof Abstract.Deployer);
    });

    it('should expose the tag through both the getter and the slot', () => {
      const Deployer = Baseline.Kitty.Implement.Deployer(createOptions());

      assert.equal(Deployer.tag, 'probe');
      assert.equal(Deployer[SYMBOL.DEPLOYER._S.TAG], 'probe');
    });

    it('should expose the server constructor through the static slot', () => {
      const options = createOptions();
      const Deployer = Baseline.Kitty.Implement.Deployer(options);

      assert.equal(Deployer[SYMBOL.DEPLOYER._S.SERVER_CTOR], options.server);
    });

    it('should expose the exchange constructors through the static slots', () => {
      const Deployer = Baseline.Kitty.Implement.Deployer(createOptions());
      const slots = SYMBOL.DEPLOYER._S.EXCHANGE_CTOR;

      assert.equal(Deployer[slots.HTTP], HTTP_EXCHANGE);
      assert.equal(Deployer[slots.WEB_SOCKET], undefined);
    });
  });

  describe('>install', () => {
    it('should call the supplied install option with the deployer kit', async () => {
      const seen = [];
      const options = createOptions({ install: (kit) => seen.push(kit) });
      const Deployer = Baseline.Kitty.Implement.Deployer(options);

      Baseline.Kitty.DeployerRegistry.registerDeployer(Deployer);

      const workflow = Baseline.createWorkflow();

      workflow.finalize();

      await workflow.compile(new options.server());

      assert.equal(seen.length, 1);
      assert.equal(typeof seen[0].declare, 'function');
    });
  });
});
