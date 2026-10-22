import { Unit } from '@produck/argot';

import * as P from './_Parser.mjs';

export default [
  {
    key: 'MaxChunkStashByteLength',
    default: Unit.Byte.GB,
    assert: P.NonNegativeInteger,
  },
  {
    key: 'MaxTransferrerBacklogWarningByteLength',
    default: Unit.Byte.GB,
    assert: P.NonNegativeInteger,
  },
  {
    key: 'DegradeOnChunkStashFullAndDone',
    default: false,
    assert: P.Boolean,
  },
  {
    key: 'ForkedReadableStreamHighWaterMark',
    default: 1,
    assert: P.HighWaterMark,
  },
  {
    key: 'MaxChunkReaderInitializeRetryCount',
    default: Infinity,
    assert: P.NonNegativeIntegerOrInfinity,
  },
  {
    key: 'ChunkReaderInitializeRetryInterval',
    default: Unit.Time.SEC,
    assert: P.NonNegativeInteger,
  },
  {
    key: 'MaxTransferrerInitializeRetryCount',
    default: Infinity,
    assert: P.NonNegativeIntegerOrInfinity,
  },
  {
    key: 'TransferrerInitializeRetryInterval',
    default: Unit.Time.SEC,
    assert: P.NonNegativeInteger,
  },
  {
    key: 'MaxTransferrerDumpRetryCount',
    default: Infinity,
    assert: P.NonNegativeIntegerOrInfinity,
  },
  {
    key: 'TransferrerDumpRetryInterval',
    default: Unit.Time.SEC,
    assert: P.NonNegativeInteger,
  },
  {
    key: 'MaxTransferrerDrainRetryCount',
    default: Infinity,
    assert: P.NonNegativeIntegerOrInfinity,
  },
  {
    key: 'TransferrerDrainRetryInterval',
    default: Unit.Time.SEC,
    assert: P.NonNegativeInteger,
  },
];
