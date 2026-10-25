import type * as net from 'node:net';
import type * as stream from 'node:stream';

/** Identity source; used to dedupe connections. */
export interface Identity {
  /**
   * Returns the dedup identity of the connection.
   *
   * @param context - Raw connection context.
   * @returns The identity object.
   */
  get(context: unknown): object;
}

/** Server accessors. */
export interface Server {
  /**
   * Returns the server that owns the connection.
   *
   * @param context - Raw connection context.
   * @returns The owning server.
   */
  get(context: unknown): net.Server;

  /** Server protocol accessor. */
  protocol: {
    /**
     * @param context - Raw connection context.
     * @returns The server protocol.
     */
    get(context: unknown): 'http:' | 'https:';
  };
}

/** HTTP version accessor. */
export interface HttpVersion {
  /**
   * Returns the HTTP version; `null` when not applicable.
   *
   * @param context - Raw connection context.
   * @returns The HTTP version, or `null`.
   */
  get(context: unknown): '1.0' | '1.1' | '2.0' | '3.0' | null;
}

/** Read-only header accessors. */
export interface Header {
  /**
   * Returns one header value; `undefined` when absent.
   *
   * @param context - Raw connection context.
   * @param key - Header name.
   * @returns The header value, or `undefined`.
   */
  get(context: unknown, key: string): string | undefined;

  /**
   * Lists every header name.
   *
   * @param context - Raw connection context.
   * @returns An iterable over header names.
   */
  keys(context: unknown): Iterable<string>;
}

/** Writable header accessors. */
export interface MutableHeader extends Header {
  /**
   * Writes one header.
   *
   * @param context - Raw connection context.
   * @param key - Header name.
   * @param value - Header value.
   */
  set(context: unknown, key: string, value: string): void;

  /**
   * Removes one header.
   *
   * @param context - Raw connection context.
   * @param key - Header name.
   */
  delete(context: unknown, key: string): void;
}

/** Request accessors. */
export interface Request {
  /** Request method accessor. */
  method: {
    /**
     * @param context - Raw connection context.
     * @returns The request method.
     */
    get(context: unknown): string;
  };

  /** Raw URL accessor. */
  URL: {
    /**
     * @param context - Raw connection context.
     * @returns The raw URL string.
     */
    get(context: unknown): string;
  };

  /** Header accessor. */
  header: Header;
}

/** Response accessors. */
export interface Response {
  /** Status code accessor. */
  status: {
    /**
     * @param context - Raw connection context.
     * @returns The status code.
     */
    get(context: unknown): number;
  };

  /** Reason phrase accessor. */
  statusText: {
    /**
     * @param context - Raw connection context.
     * @returns The reason phrase.
     */
    get(context: unknown): string;
  };

  /** Completion probe. */
  finished: {
    /**
     * @param context - Raw connection context.
     * @returns `true` when every write is done.
     */
    is(context: unknown): boolean;
  };

  /** Header accessor. */
  header: Header;
}

/** Writable response accessors. */
export interface MutableResponse extends Response {
  /** Status code accessor plus writer. */
  status: {
    /**
     * @param context - Raw connection context.
     * @returns The status code.
     */
    get(context: unknown): number;

    /**
     * @param context - Raw connection context.
     * @param value - Status code to write.
     */
    set(context: unknown, value: number): void;
  };

  /** Reason phrase accessor plus writer. */
  statusText: {
    /**
     * @param context - Raw connection context.
     * @returns The reason phrase.
     */
    get(context: unknown): string;

    /**
     * @param context - Raw connection context.
     * @param value - Reason phrase to write.
     */
    set(context: unknown, value: string): void;
  };

  /** Writable header accessor. */
  header: MutableHeader;
}

/** HTTP request accessors: adds the body source. */
export interface HttpRequest extends Request {
  /** Request body accessors. */
  body: {
    /** Source accessor. */
    source: {
      /**
       * @param context - Raw connection context.
       * @returns The source readable.
       */
      get(context: unknown): stream.Readable;
    };
  };
}

/** HTTP response accessors: adds the body writer. */
export interface HttpResponse extends MutableResponse {
  /** Response body accessors. */
  body: {
    /** Body data accessor. */
    data: {
      /**
       * Writes the body data.
       *
       * @param context - Raw connection context.
       * @param value - Body data to write.
       */
      set(
        context: unknown,
        value: { stream: ReadableStream | null; length: number | null },
      ): void;
    };
  };
}

/** WebSocket controller accessors. */
export interface WebSocketController {
  /** Ready state accessor. */
  readyState: {
    /**
     * @param context - Raw connection context.
     * @returns The ready state.
     */
    get(context: unknown): number;
  };

  /** Frame writer. */
  send: {
    /**
     * @param context - Raw connection context.
     * @param data - Text or binary payload.
     */
    send(context: unknown, data: string | Uint8Array): void;
  };

  /** Closing handshake starter. */
  close: {
    /**
     * @param context - Raw connection context.
     * @param code - Close code.
     * @param reason - Close reason.
     */
    close(context: unknown, code?: number, reason?: string): void;
  };
}

/** Everything needed to build an HTTP exchange class. */
export interface BaseOptions {
  /** Identity source. */
  identity: Identity;

  /** Server accessors. */
  server: Server;

  /** HTTP version accessor. */
  httpVersion: HttpVersion;

  /** Request accessors. */
  request: Request;
}

/** Everything needed to build an HTTP exchange class. */
export interface HttpOptions extends BaseOptions {
  /** Request accessors, including the body source. */
  request: HttpRequest;

  /** Writable response accessors. */
  response: HttpResponse;
}

/** Everything needed to build a WebSocket exchange class. */
export interface WebSocketOptions extends BaseOptions {
  /** Response accessors. */
  response: Response;

  /** Controller accessors. */
  controller: WebSocketController;
}

/** HTTP exchange class produced by the factory. */
export type HttpClass =
  typeof import('../../CompoundWorkflow/HttpExchange/index.d.mts').Abstract;

/** WebSocket exchange class produced by the factory. */
export type WebSocketClass =
  typeof import('../../CompoundWorkflow/WebSocketExchange/index.d.mts').Abstract;

/**
 * Creates an HTTP exchange class from the given port implementations.
 *
 * @param options - Ports the HTTP exchange reads through.
 * @returns An HTTP exchange class.
 */
export declare function Http(options: HttpOptions): HttpClass;

/**
 * Creates a WebSocket exchange class from the given ports.
 *
 * @param options - Ports the WebSocket exchange reads through.
 * @returns A WebSocket exchange class.
 */
export declare function WebSocket(options: WebSocketOptions): WebSocketClass;
