import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Baseline from './Baseline/index.mjs';

const INVALID_VALUES = {
  AllowedBodyMethods: ['POST', ['GET', 'NOPE'], ['GET', 1]],
  ChunkReaderInitializeRetryInterval: ['1', -1, 1.5],
  DegradeOnChunkStashFullAndDone: ['true', 1, null],
  ForkedReadableStreamHighWaterMark: ['1', Number.NaN, -1],
  MaxBodySize: [0, '1024', 1.5],
  MaxChunkReaderInitializeRetryCount: [-1, '1', 1.5],
  MaxChunkStashByteLength: [-1, '1', 1.5],
  MaxExchangeTimeout: [0, '1000', 1.5],
  MaxTransferrerBacklogWarningByteLength: [-1, '1', 1.5],
  MaxTransferrerDrainRetryCount: [-1, '1', 1.5],
  MaxTransferrerDumpRetryCount: [-1, '1', 1.5],
  MaxTransferrerInitializeRetryCount: [-1, '1', 1.5],
  TransferrerDrainRetryInterval: [-1, '1', 1.5],
  TransferrerDumpRetryInterval: [-1, '1', 1.5],
  TransferrerInitializeRetryInterval: [-1, '1', 1.5],
};

const VALID_VALUES = {
  AllowedBodyMethods: ['GET'],
  ChunkReaderInitializeRetryInterval: 0,
  DegradeOnChunkStashFullAndDone: true,
  ForkedReadableStreamHighWaterMark: 0,
  MaxBodySize: 1,
  MaxChunkReaderInitializeRetryCount: Infinity,
  MaxChunkStashByteLength: 0,
  MaxExchangeTimeout: 1,
  MaxTransferrerBacklogWarningByteLength: 1024,
  MaxTransferrerDrainRetryCount: 3,
  MaxTransferrerDumpRetryCount: 3,
  MaxTransferrerInitializeRetryCount: 3,
  TransferrerDrainRetryInterval: 1,
  TransferrerDumpRetryInterval: 1,
  TransferrerInitializeRetryInterval: 1,
};

const createWorkflow = () => Baseline.createWorkflow();

describe('::Tune', () => {
  it('should cover every configuration key of ::Get', () => {
    const keys = Object.keys(Baseline.Kitty.Tune).sort();

    assert.deepEqual(Object.keys(INVALID_VALUES).sort(), keys);
    assert.deepEqual(Object.keys(VALID_VALUES).sort(), keys);
  });

  it('should reject every invalid value', () => {
    for (const [key, values] of Object.entries(INVALID_VALUES)) {
      const workflow = createWorkflow();

      for (const value of values) {
        assert.throws(() => Baseline.Kitty.Tune[key](workflow, value), key);
      }
    }
  });

  it('should reject a workflow that is not installed', () => {
    assert.throws(() => Baseline.Kitty.Tune.MaxExchangeTimeout({}, 1000));
  });

  it('should apply every valid value', () => {
    const workflow = createWorkflow();

    for (const [key, value] of Object.entries(VALID_VALUES)) {
      Baseline.Kitty.Tune[key](workflow, value);

      assert.deepEqual(Baseline.Kitty.Get[key](workflow), value, key);
    }
  });
});

describe('::Get', () => {
  it('should read the default of every configuration key', () => {
    const workflow = createWorkflow();

    for (const key of Object.keys(Baseline.Kitty.Get)) {
      assert.notEqual(Baseline.Kitty.Get[key](workflow), undefined, key);
    }
  });

  it('should reject a workflow that is not installed', () => {
    assert.throws(() => Baseline.Kitty.Get.MaxExchangeTimeout({}));
  });
});
