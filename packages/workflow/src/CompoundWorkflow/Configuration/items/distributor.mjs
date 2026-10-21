import { Unit } from '@produck/argot';

import * as Assert from '../../../Workflow/Exchange/Parser.mjs';

export default [
  {
    key: 'MaxChunkStashByteLength',
    default: Unit.Byte.GB,
    assert: Assert.NonNegativeInteger,
  },
  {
    key: 'MaxTransferrerBacklogWarningByteLength',
    default: Unit.Byte.GB,
    assert: Assert.NonNegativeInteger,
  },
  {
    key: 'DegradeOnChunkStashFullAndDone',
    default: false,
    assert: Assert.Boolean,
  },
  {
    key: 'ForkedReadableStreamHighWaterMark',
    default: 1,
    assert: Assert.HighWaterMark,
  },
  {
    key: 'MaxChunkReaderInitializeRetryCount',
    default: Infinity,
    assert: Assert.NonNegativeIntegerOrInfinity,
  },
  {
    key: 'ChunkReaderInitializeRetryInterval',
    default: Unit.Time.SEC,
    assert: Assert.NonNegativeInteger,
  },
  {
    key: 'MaxTransferrerInitializeRetryCount',
    default: Infinity,
    assert: Assert.NonNegativeIntegerOrInfinity,
  },
  {
    key: 'TransferrerInitializeRetryInterval',
    default: Unit.Time.SEC,
    assert: Assert.NonNegativeInteger,
  },
  {
    key: 'MaxTransferrerDumpRetryCount',
    default: Infinity,
    assert: Assert.NonNegativeIntegerOrInfinity,
  },
  {
    key: 'TransferrerDumpRetryInterval',
    default: Unit.Time.SEC,
    assert: Assert.NonNegativeInteger,
  },
  {
    key: 'MaxTransferrerDrainRetryCount',
    default: Infinity,
    assert: Assert.NonNegativeIntegerOrInfinity,
  },
  {
    key: 'TransferrerDrainRetryInterval',
    default: Unit.Time.SEC,
    assert: Assert.NonNegativeInteger,
  },
];
