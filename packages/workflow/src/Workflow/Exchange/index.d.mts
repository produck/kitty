import type * as net from 'node:net';

import type * as Workflow from '../../CompoundWorkflow/index.d.mts';
import type * as Request from './Request/index.d.mts';
import type * as _Symbol from './_Symbol.d.mts';

/** Exchange port on the ExchangeKit. */
export declare const K_EXCHANGE: unique symbol;

/** Request part port on the ExchangeKit. */
export declare const K_REQUEST: unique symbol;

/** Supported HTTP versions. */
export type HttpVersion = '1.0' | '1.1' | '2.0' | '3.0';

/** Supported server protocols. */
export type ServerProtocol = 'http:' | 'https:';

/**
 * Exchange shell: protocol agnostic; declares the request part and the facts
 * shared by every protocol. The concrete protocol comes from subclasses;
 * the request part is plugged in through a static slot.
 */
declare class Exchange<Internal = object> extends EventTarget {
  /** Owning workflow. */
  readonly workflow: Workflow.Abstract;

  /** Request part. */
  readonly request: Request.Abstract<Internal>;

  /** Request method. */
  readonly method: string;

  /** Request URL. */
  readonly url: URL;

  /** Server instance that owns this connection. */
  readonly server: net.Server;

  /** Server protocol (`'http:'` / `'https:'`). */
  readonly protocol: ServerProtocol;

  /** Exchange mode; the concrete protocol decides the value. */
  readonly mode: string;

  /** HTTP version; `null` when not applicable. */
  readonly httpVersion: HttpVersion | null;

  /** An exchange is not serializable; always throws. */
  toJSON(): never;

  /**
   * Implementation: reads the HTTP version.
   *
   * @param internal - Connection record supplied by the deployer.
   * @returns The HTTP version, or `null` when not applicable.
   */
  [_Symbol._I.HTTP_VERSION](internal: Internal): HttpVersion | null;

  /**
   * Implementation: reads the exchange mode.
   *
   * @param internal - Connection record supplied by the deployer.
   * @returns The exchange mode.
   */
  [_Symbol._I.MODE](internal: Internal): string;

  /**
   * Implementation: reads the server instance.
   *
   * @param internal - Connection record supplied by the deployer.
   * @returns The server that owns the connection.
   */
  [_Symbol._I.SERVER.GET](internal: Internal): net.Server;

  /**
   * Implementation: reads the server protocol.
   *
   * @param internal - Connection record supplied by the deployer.
   * @returns The server protocol.
   */
  [_Symbol._I.SERVER.PROTOCOL.GET](internal: Internal): ServerProtocol;

  /**
   * Implementation: extracts the dedup identity from a connection record.
   *
   * @param internal - Connection record supplied by the deployer.
   * @returns The identity object used for deduplication.
   */
  static [_Symbol._S.IDENTITY](internal: object): object;

  /** Implementation: constructor of the request part. */
  static readonly [_Symbol._S.REQUEST_CTOR]: abstract new (
    ...args: never[]
  ) => Request.Abstract;
}

export { Exchange as Abstract };
