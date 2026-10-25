import type * as Workflow from '../index.d.mts';

/** Per-exchange limits. */
export interface ExchangeConfiguration {
  /** Maximum lifetime of one exchange, in ms. */
  MaxExchangeTimeout: number;

  /** Maximum request body size, in bytes. */
  MaxBodySize: number;

  /** Methods whose request body may be read. */
  AllowedBodyMethods: string[];
}

/** Request body distributor tuning. */
export interface DistributorConfiguration {
  /** Byte limit of one chunk stash. */
  MaxChunkStashByteLength: number;

  /** Backlog warning threshold, in bytes. */
  MaxTransferrerBacklogWarningByteLength: number;

  /** Degrade when the chunk stash is full and already done. */
  DegradeOnChunkStashFullAndDone: boolean;

  /** High water mark of a forked readable stream. */
  ForkedReadableStreamHighWaterMark: number;

  /** Chunk reader initialize retry limit. */
  MaxChunkReaderInitializeRetryCount: number;

  /** Chunk reader initialize retry interval, in ms. */
  ChunkReaderInitializeRetryInterval: number;

  /** Transferrer initialize retry limit. */
  MaxTransferrerInitializeRetryCount: number;

  /** Transferrer initialize retry interval, in ms. */
  TransferrerInitializeRetryInterval: number;

  /** Transferrer dump retry limit. */
  MaxTransferrerDumpRetryCount: number;

  /** Transferrer dump retry interval, in ms. */
  TransferrerDumpRetryInterval: number;

  /** Transferrer drain retry limit. */
  MaxTransferrerDrainRetryCount: number;

  /** Transferrer drain retry interval, in ms. */
  TransferrerDrainRetryInterval: number;
}

/** Full configuration key set. */
export interface Configuration
  extends ExchangeConfiguration, DistributorConfiguration {}

/** Writer view: every key sets one value on a workflow. */
export type Tune = {
  readonly [Key in keyof Configuration]: (
    workflow: Workflow.Abstract,
    value: Configuration[Key],
  ) => void;
};

/** Reader view: every key reads one value from a workflow. */
export type Get = {
  readonly [Key in keyof Configuration]: (
    workflow: Workflow.Abstract,
  ) => Configuration[Key];
};

/** Writes configuration entries onto a workflow. */
export declare const Tune: Tune;

/** Reads configuration entries from a workflow. */
export declare const Get: Get;
