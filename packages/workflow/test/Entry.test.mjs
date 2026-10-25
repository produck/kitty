import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Baseline from './Baseline/index.mjs';

const ABSTRACT_KEYS = [
  'Deployer',
  'Exchange',
  'ExchangeMutableHeader',
  'ExchangeMutableResponse',
  'ExchangeRequest',
  'ExchangeRequestHeader',
  'ExchangeResponse',
  'ExchangeResponseHeader',
  'HttpExchange',
  'HttpRequest',
  'HttpRequestBody',
  'HttpResponse',
  'HttpResponseBody',
  'Plugin',
  'WebSocketController',
  'WebSocketExchange',
  'WebSocketResponse',
  'Workflow',
];

const SYMBOL_KEYS = [
  'DEPLOYER',
  'EXCHANGE',
  'EXCHANGE_MUTABLE_RESPONSE',
  'EXCHANGE_REQUEST',
  'EXCHANGE_REQUEST_HEADER',
  'EXCHANGE_RESPONSE',
  'EXCHANGE_RESPONSE_HEADER',
  'EXCHANGE_RESPONSE_MUTABLE_HEADER',
  'HTTP_REQUEST',
  'HTTP_REQUEST_BODY',
  'HTTP_RESPONSE',
  'HTTP_RESPONSE_BODY',
  'PLUGIN',
  'WEB_SOCKET_CONTROLLER',
  'WEB_SOCKET_EXCHANGE',
  'WORKFLOW',
];

const USE_LIST = [
  'useExchange',
  'useRequest',
  'useResponse',
  'useServer',
  'useWebSocket',
  'useWorkflow',
];

describe('package entry', () => {
  describe('::Abstract', () => {
    it('should be a frozen record of the abstract subjects', () => {
      assert.ok(Object.isFrozen(Baseline.Kitty.Abstract));
      assert.deepEqual(
        Object.keys(Baseline.Kitty.Abstract).sort(),
        ABSTRACT_KEYS,
      );
    });

    it('should expose each subject as a constructor', () => {
      for (const key of ABSTRACT_KEYS) {
        assert.equal(typeof Baseline.Kitty.Abstract[key], 'function', key);
      }
    });

    it('should be derived from by every implementer', () => {
      const workflow = Baseline.Kitty.Implement.Workflow({
        normalizeHttpResponseBodyData: () => ({ stream: null, length: 0 }),
      });

      assert.equal(typeof workflow, 'function');
      assert.ok(workflow.prototype instanceof Baseline.Kitty.Abstract.Workflow);
    });
  });

  describe('::SYMBOL', () => {
    it('should cover the abstract subjects only', () => {
      assert.ok(Object.isFrozen(Baseline.Kitty.SYMBOL));
      assert.deepEqual(Object.keys(Baseline.Kitty.SYMBOL).sort(), SYMBOL_KEYS);
    });
  });

  describe('::Implement', () => {
    it('should expose the factory namespace', () => {
      assert.deepEqual(Object.keys(Baseline.Kitty.Implement).sort(), [
        'Deployer',
        'Exchange',
        'Normalize',
        'Plugin',
        'Workflow',
      ]);
      assert.deepEqual(Object.keys(Baseline.Kitty.Implement.Exchange).sort(), [
        'Http',
        'WebSocket',
      ]);
    });

    it('should expose the normalizer namespace', () => {
      assert.deepEqual(Object.keys(Baseline.Kitty.Implement.Normalize).sort(), [
        'Deployer',
        'Exchange',
        'Plugin',
        'Workflow',
      ]);
      assert.deepEqual(
        Object.keys(Baseline.Kitty.Implement.Normalize.Exchange).sort(),
        ['Base', 'Http', 'WebSocket'],
      );
    });
  });

  describe('::DeployerRegistry', () => {
    it('should expose the registry operations', () => {
      for (const key of [
        'associate',
        'assertDeployer',
        'getByServer',
        'isAvaiableServer',
        'registerDeployer',
      ]) {
        assert.equal(
          typeof Baseline.Kitty.DeployerRegistry[key],
          'function',
          key,
        );
      }
    });
  });

  describe('::Tune', () => {
    it('should expose the configuration tuners', () => {
      assert.equal(typeof Baseline.Kitty.Tune, 'object');
      assert.equal(typeof Baseline.Kitty.Get, 'object');
      assert.deepEqual(
        Object.keys(Baseline.Kitty.Get).sort(),
        Object.keys(Baseline.Kitty.Tune).sort(),
      );
    });
  });

  describe('capability accessors', () => {
    it('should expose every accessor as a function', () => {
      for (const key of USE_LIST) {
        assert.equal(typeof Baseline.Kitty[key], 'function', key);
      }
    });
  });

  describe('private surface', () => {
    it('should not expose the private phase', () => {
      assert.equal(Baseline.Kitty.I, undefined);
    });

    it('should not expose the protected instance phase', () => {
      assert.equal(Baseline.Kitty.$I, undefined);
    });

    it('should not expose the private or protected static phases', () => {
      assert.equal(Baseline.Kitty.S, undefined);
      assert.equal(Baseline.Kitty.$S, undefined);
    });
  });
});
