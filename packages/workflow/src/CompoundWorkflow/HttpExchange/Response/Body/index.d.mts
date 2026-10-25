import type * as Part from '../../../../Workflow/Exchange/Part/index.d.mts';
import type * as Exchange from '../../../../Workflow/Exchange/index.d.mts';
import type * as Workflow from '../../../index.d.mts';
import type * as _Symbol from './_Symbol.d.mts';

/** HTTP response body: the single write entry. */
declare class HttpResponseBody<
  Internal = object,
> extends Part.Concrete<Internal> {
  /**
   * @param exchange - Exchange this part belongs to.
   */
  constructor(exchange: Exchange.Abstract<Internal>);

  /** Body data to write, shaped as `{ stream, length }`. */
  data: Workflow.ResponseBodyData;

  /**
   * Implementation: writes the body data.
   *
   * @param internal - Connection record supplied by the deployer.
   * @param data - Body data to write.
   */
  [_Symbol._I.DATA.SET](
    internal: Internal,
    data: Workflow.ResponseBodyData,
  ): void;
}

export { HttpResponseBody as Abstract };
