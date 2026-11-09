import type { Record } from '@produck/kitty-charset';

/** One user supplied charset record; `preferredName` defaults to `name`. */
export declare interface Input {
  /** Non-empty string without whitespace, case-preserved. */
  name: string;

  /** Unique MIBenum value. */
  mibEnum: number;

  /** Defaults to `name` when omitted. */
  preferredName?: string;

  /** Extra spellings; `name` and `preferredName` are merged in. */
  aliasList: readonly string[];
}

export declare function copy(value: Record): Record;

export declare function normalizeRecord(record: Input): Record;

export { normalizeRecord as normalize };
