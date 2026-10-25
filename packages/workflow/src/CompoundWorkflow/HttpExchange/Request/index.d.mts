import type * as Request from '../../../Workflow/Exchange/Request/index.d.mts';
import type * as Exchange from '../../../Workflow/Exchange/index.d.mts';
import type * as Body from './Body/index.d.mts';
import type * as _Symbol from './_Symbol.d.mts';

/** HTTP request: adds a readable body. */
declare class HttpRequest<
  Internal = object,
> extends Request.Abstract<Internal> {
  /**
   * @param exchange - Exchange this part belongs to.
   */
  constructor(exchange: Exchange.Abstract<Internal>);

  /** Request body part. */
  readonly body: Body.Abstract<Internal>;

  /** Implementation: constructor of the request body part. */
  static readonly [_Symbol._S.BODY_CTOR]: abstract new (
    ...args: never[]
  ) => Body.Abstract;
}

export { HttpRequest as Abstract };
