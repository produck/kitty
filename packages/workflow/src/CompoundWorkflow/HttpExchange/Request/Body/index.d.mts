import type * as Fugue from '@produck/fugue';
import type * as stream from 'node:stream';

import type * as Part from '../../../../Workflow/Exchange/Part/index.d.mts';
import type * as Exchange from '../../../../Workflow/Exchange/index.d.mts';
import type * as _Symbol from './_Symbol.d.mts';

/** HTTP request body: exposes the body stream and its distributor. */
declare class HttpRequestBody<
  Internal = object,
> extends Part.Concrete<Internal> {
  /**
   * @param exchange - Exchange this part belongs to.
   */
  constructor(exchange: Exchange.Abstract<Internal>);

  /** Body stream; every access forks a new branch. */
  readonly data: ReadableStream;

  /** Distributor that feeds the body stream. */
  readonly distributor: Fugue.Distributor;

  /**
   * Raw node request object the deployer handed in; the node stream the
   * distributor would wrap, not the wrapper itself.
   */
  readonly source: stream.Readable;

  /**
   * Switches the body to the raw stream path: the distributor can no
   * longer be built and `data` / `distributor` stop working. Claiming
   * again is a no-op.
   *
   * @throws When the distributor path has already been claimed.
   */
  claimRaw(): void;

  /**
   * Implementation: reads the source readable.
   *
   * @param internal - Connection record supplied by the deployer.
   * @returns The source readable stream.
   */
  [_Symbol._I.SOURCE.GET](internal: Internal): stream.Readable;
}

export { HttpRequestBody as Abstract };
