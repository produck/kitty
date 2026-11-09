/** One registered character set. */
export interface Record {
  /** Official IANA name, unchanged from the registry. */
  name: string;

  /** Unique MIBenum value. */
  mibEnum: number;

  /** Preferred alias when IANA declares one, otherwise `name`. */
  preferredName: string;

  /** Every accepted spelling, including `name`. */
  aliasList: string[];
}

/**
 * Charset selector.
 *
 * Not an iterator. Every query walks a private iterator that yields the
 * whole IANA registry and then whatever the extension iterator yields.
 */
export default abstract class Selector {
  /** Finds a record by its official name, case-insensitively. */
  findByName(name: string): Record | null;

  /** Finds a record by its MIBenum. */
  findByMibEnum(mibEnum: number): Record | null;

  /** Finds a record by its preferred name, case-insensitively. */
  findByPreferredName(name: string): Record | null;

  /** Finds a record by any of its aliases, case-insensitively. */
  findByAlias(alias: string): Record | null;
}
