import type * as MutableResponse from '../../../Workflow/Exchange/MutableResponse/index.d.mts';
import type * as Exchange from '../../../Workflow/Exchange/index.d.mts';
import type * as Body from './Body/index.d.mts';
import type * as _Symbol from './_Symbol.d.mts';

/** HTTP response: adds a writable body. */
declare class HttpResponse<
  Internal = object,
> extends MutableResponse.Abstract<Internal> {
  /**
   * @param exchange - Exchange this part belongs to.
   */
  constructor(exchange: Exchange.Abstract<Internal>);

  /** Response body part. */
  readonly body: Body.Abstract<Internal>;

  /** Implementation: constructor of the response body part. */
  static readonly [_Symbol._S.BODY_CTOR]: abstract new (
    ...args: never[]
  ) => Body.Abstract;
}

export { HttpResponse as Abstract };
