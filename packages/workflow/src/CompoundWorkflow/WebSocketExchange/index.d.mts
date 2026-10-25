import type * as Exchange from '../../Workflow/Exchange/index.d.mts';
import type * as Controller from './Controller/index.d.mts';
import type * as _Symbol from './_Symbol.d.mts';

/** Controller port on the exchange kit. */
export declare const K_CONTROLLER: unique symbol;

/**
 * WebSocket exchange: represents the whole connection; the controller is the
 * subject.
 */
declare class WebSocketExchange<
  Internal = object,
> extends Exchange.Abstract<Internal> {
  /** Connection controller. */
  readonly controller: Controller.Abstract<Internal>;

  /** Implementation: constructor of the controller. */
  static readonly [_Symbol._S.CONTROLLER_CTOR]: abstract new (
    ...args: never[]
  ) => Controller.Abstract;
}

export { WebSocketExchange as Abstract };
