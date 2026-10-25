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
   * Implementation: reads the source readable.
   *
   * @param internal - Connection record supplied by the deployer.
   * @returns The source readable stream.
   */
  [_Symbol._I.SOURCE.GET](internal: Internal): stream.Readable;
}

export { HttpRequestBody as Abstract };
