/**
 * All abstract classes. Implementers extend them; the framework ships no
 * ready-to-use products.
 */
export declare const Abstract: Readonly<{
  /**
   * Compound workflow: pipeline + mixin + deployment entry; declares the
   * response body normalization slot.
   */
  Workflow: typeof import('./CompoundWorkflow/index.d.mts').Abstract;

  /**
   * Deployer: instance-level abstraction; `_I.INSTALL` is the only deployment
   * definition entry.
   */
  Deployer: typeof import('./CompoundWorkflow/Deployer/index.d.mts').Abstract;

  /**
   * Plugin: attaches capabilities to the workflow kit; can only be mixed in
   * before finalize.
   */
  Plugin: typeof import('./CompoundWorkflow/Plugin/index.d.mts').Abstract;

  /**
   * Exchange shell: protocol agnostic; request and response are provided by
   * subclasses.
   */
  Exchange: typeof import('./Workflow/Exchange/index.d.mts').Abstract;

  /**
   * Request part: `method` and `url` come from abstract slots; `url` accepts
   * relative targets.
   */
  ExchangeRequest: typeof import('./Workflow/Exchange/Request/index.d.mts').Abstract;

  /** Request header part: read-only view; `get` is case-insensitive. */
  ExchangeRequestHeader: typeof import('./Workflow/Exchange/Request/Header/index.d.mts').Abstract;

  /** Response part: `statusCode` / `statusText` / `isFinished`. */
  ExchangeResponse: typeof import('./Workflow/Exchange/Response/index.d.mts').Abstract;

  /** Response header part: read-only view; `get` is case-insensitive. */
  ExchangeResponseHeader: typeof import('./Workflow/Exchange/Response/Header/index.d.mts').Abstract;

  /** Mutable response: `setStatus` writes status code and reason phrase. */
  ExchangeMutableResponse: typeof import('./Workflow/Exchange/MutableResponse/index.d.mts').Abstract;

  /** Mutable response header: `set` / `delete` / `clear`. */
  ExchangeMutableHeader: typeof import('./Workflow/Exchange/Response/MutableHeader/index.d.mts').Abstract;

  /**
   * HTTP exchange: `mode` is always `'http'`; carries request and response
   * bodies.
   */
  HttpExchange: typeof import('./CompoundWorkflow/HttpExchange/index.d.mts').Abstract;

  /**
   * HTTP request: its body is readable only for methods allowed by
   * `AllowedBodyMethods`.
   */
  HttpRequest: typeof import('./CompoundWorkflow/HttpExchange/Request/index.d.mts').Abstract;

  /** HTTP request body: every `data` access forks a fresh stream. */
  HttpRequestBody: typeof import('./CompoundWorkflow/HttpExchange/Request/Body/index.d.mts').Abstract;

  /** HTTP response: carries a writable body. */
  HttpResponse: typeof import('./CompoundWorkflow/HttpExchange/Response/index.d.mts').Abstract;

  /**
   * HTTP response body: write entry; `data` is shaped as
   * `{ stream, length }`.
   */
  HttpResponseBody: typeof import('./CompoundWorkflow/HttpExchange/Response/Body/index.d.mts').Abstract;

  /**
   * WebSocket exchange: represents the whole connection; the controller is the
   * subject.
   */
  WebSocketExchange: typeof import('./CompoundWorkflow/WebSocketExchange/index.d.mts').Abstract;

  /** WebSocket controller: `readyState` / `send` / `close`. */
  WebSocketController: typeof import('./CompoundWorkflow/WebSocketExchange/Controller/index.d.mts').Abstract;

  /**
   * WebSocket response: the opening record left by the handshake;
   * `isFinished` is always true.
   */
  WebSocketResponse: typeof import('./CompoundWorkflow/WebSocketExchange/Response/index.d.mts').Abstract;
}>;

/**
 * Type-side mirror of `Abstract`, so `Abstract.Workflow` is usable as both
 * value and type.
 */
export declare namespace Abstract {
  /** Class type behind `Abstract.Workflow`. */
  type Workflow = import('./CompoundWorkflow/index.d.mts').Abstract;

  /** Class type behind `Abstract.Deployer`. */
  type Deployer = import('./CompoundWorkflow/Deployer/index.d.mts').Abstract;

  /** Class type behind `Abstract.Plugin`. */
  type Plugin = import('./CompoundWorkflow/Plugin/index.d.mts').Abstract;

  /** Class type behind `Abstract.Exchange`. */
  type Exchange = import('./Workflow/Exchange/index.d.mts').Abstract;

  /** Class type behind `Abstract.ExchangeRequest`. */
  type ExchangeRequest =
    import('./Workflow/Exchange/Request/index.d.mts').Abstract;

  /** Class type behind `Abstract.ExchangeRequestHeader`. */
  type ExchangeRequestHeader =
    import('./Workflow/Exchange/Request/Header/index.d.mts').Abstract;

  /** Class type behind `Abstract.ExchangeResponse`. */
  type ExchangeResponse =
    import('./Workflow/Exchange/Response/index.d.mts').Abstract;

  /** Class type behind `Abstract.ExchangeResponseHeader`. */
  type ExchangeResponseHeader =
    import('./Workflow/Exchange/Response/Header/index.d.mts').Abstract;

  /** Class type behind `Abstract.ExchangeMutableResponse`. */
  type ExchangeMutableResponse =
    import('./Workflow/Exchange/MutableResponse/index.d.mts').Abstract;

  /** Class type behind `Abstract.ExchangeMutableHeader`. */
  type ExchangeMutableHeader =
    import('./Workflow/Exchange/Response/MutableHeader/index.d.mts').Abstract;

  /** Class type behind `Abstract.HttpExchange`. */
  type HttpExchange =
    import('./CompoundWorkflow/HttpExchange/index.d.mts').Abstract;

  /** Class type behind `Abstract.HttpRequest`. */
  type HttpRequest =
    import('./CompoundWorkflow/HttpExchange/Request/index.d.mts').Abstract;

  /** Class type behind `Abstract.HttpRequestBody`. */
  type HttpRequestBody =
    import('./CompoundWorkflow/HttpExchange/Request/Body/index.d.mts').Abstract;

  /** Class type behind `Abstract.HttpResponse`. */
  type HttpResponse =
    import('./CompoundWorkflow/HttpExchange/Response/index.d.mts').Abstract;

  /** Class type behind `Abstract.HttpResponseBody`. */
  type HttpResponseBody =
    import('./CompoundWorkflow/HttpExchange/Response/Body/index.d.mts').Abstract;

  /** Class type behind `Abstract.WebSocketExchange`. */
  type WebSocketExchange =
    import('./CompoundWorkflow/WebSocketExchange/index.d.mts').Abstract;

  /** Class type behind `Abstract.WebSocketController`. */
  type WebSocketController =
    import('./CompoundWorkflow/WebSocketExchange/Controller/index.d.mts').Abstract;

  /** Class type behind `Abstract.WebSocketResponse`. */
  type WebSocketResponse =
    import('./CompoundWorkflow/WebSocketExchange/Response/index.d.mts').Abstract;
}

/**
 * Symbol groups exposed per subject; only `_I` (instance abstract) and `_S`
 * (static abstract) are public.
 */
export declare const SYMBOL: Readonly<{
  /** Abstract slots of the compound workflow. */
  WORKFLOW: Readonly<{
    _I: typeof import('./CompoundWorkflow/_Symbol.d.mts')._I;
  }>;

  /** Deployer: install entry plus static slots. */
  DEPLOYER: Readonly<{
    _I: typeof import('./CompoundWorkflow/Deployer/_Symbol.d.mts')._I;

    _S: typeof import('./CompoundWorkflow/Deployer/_Symbol.d.mts')._S;
  }>;

  /** Plugin: install entry plus static slots. */
  PLUGIN: Readonly<{
    _I: typeof import('./CompoundWorkflow/Plugin/_Symbol.d.mts')._I;

    _S: typeof import('./CompoundWorkflow/Plugin/_Symbol.d.mts')._S;
  }>;

  /** Abstract slots of the exchange shell. */
  EXCHANGE: Readonly<{
    _I: typeof import('./Workflow/Exchange/_Symbol.d.mts')._I;

    _S: typeof import('./Workflow/Exchange/_Symbol.d.mts')._S;
  }>;

  /** Abstract slots of the request part. */
  EXCHANGE_REQUEST: Readonly<{
    _I: typeof import('./Workflow/Exchange/Request/_Symbol.d.mts')._I;

    _S: typeof import('./Workflow/Exchange/Request/_Symbol.d.mts')._S;
  }>;

  /** Abstract slots of the request header part. */
  EXCHANGE_REQUEST_HEADER: Readonly<{
    _I: typeof import('./Workflow/Exchange/Request/Header/_Symbol.d.mts')._I;
  }>;

  /** Abstract slots of the response part. */
  EXCHANGE_RESPONSE: Readonly<{
    _I: typeof import('./Workflow/Exchange/Response/_Symbol.d.mts')._I;

    _S: typeof import('./Workflow/Exchange/Response/_Symbol.d.mts')._S;
  }>;

  /** Abstract slots of the response header part. */
  EXCHANGE_RESPONSE_HEADER: Readonly<{
    _I: typeof import('./Workflow/Exchange/Response/Header/_Symbol.d.mts')._I;
  }>;

  /** Abstract slots of the mutable response header. */
  EXCHANGE_RESPONSE_MUTABLE_HEADER: Readonly<{
    _I: typeof import('./Workflow/Exchange/Response/MutableHeader/_Symbol.d.mts')._I;
  }>;

  /** Abstract slots of the mutable response. */
  EXCHANGE_MUTABLE_RESPONSE: Readonly<{
    _I: typeof import('./Workflow/Exchange/MutableResponse/_Symbol.d.mts')._I;
  }>;

  /** Static slots of the HTTP request. */
  HTTP_REQUEST: Readonly<{
    _S: typeof import('./CompoundWorkflow/HttpExchange/Request/_Symbol.d.mts')._S;
  }>;

  /** Abstract slots of the HTTP request body. */
  HTTP_REQUEST_BODY: Readonly<{
    _I: typeof import('./CompoundWorkflow/HttpExchange/Request/Body/_Symbol.d.mts')._I;
  }>;

  /** Static slots of the HTTP response. */
  HTTP_RESPONSE: Readonly<{
    _S: typeof import('./CompoundWorkflow/HttpExchange/Response/_Symbol.d.mts')._S;
  }>;

  /** Abstract slots of the HTTP response body. */
  HTTP_RESPONSE_BODY: Readonly<{
    _I: typeof import('./CompoundWorkflow/HttpExchange/Response/Body/_Symbol.d.mts')._I;
  }>;

  /** Static slots of the WebSocket exchange. */
  WEB_SOCKET_EXCHANGE: Readonly<{
    _S: typeof import('./CompoundWorkflow/WebSocketExchange/_Symbol.d.mts')._S;
  }>;

  /** Abstract slots of the WebSocket controller. */
  WEB_SOCKET_CONTROLLER: Readonly<{
    _I: typeof import('./CompoundWorkflow/WebSocketExchange/Controller/_Symbol.d.mts')._I;
  }>;
}>;

/**
 * Deployer registry: registers and resolves deployer classes by server
 * constructor.
 */
export declare const DeployerRegistry: typeof import('./CompoundWorkflow/Deployer/Registry.d.mts');

/** Controller event constants and the `Close` event class. */
export declare const WebSocketControllerEvent: typeof import('./CompoundWorkflow/WebSocketExchange/Controller/Event.d.mts');

/** Configuration writer; its key set matches `Configuration`. */
export declare const Tune: typeof import('./CompoundWorkflow/Configuration/index.d.mts').Tune;

/** Configuration reader; valid only for a workflow that installed it. */
export declare const Get: typeof import('./CompoundWorkflow/Configuration/index.d.mts').Get;

/** Implementation definer: hands out a whole set of constructors at once. */
export declare const Implement: typeof import('./Implement/index.d.mts');

/** Reads the owning workflow from a kit. */
export declare const useWorkflow: typeof import('./Capability.d.mts').useWorkflow;

/** Reads the target server from a kit. */
export declare const useServer: typeof import('./Capability.d.mts').useServer;

/** Reads the current exchange from a kit. */
export declare const useExchange: typeof import('./Capability.d.mts').useExchange;

/** Reads the current request part from a kit. */
export declare const useRequest: typeof import('./Capability.d.mts').useRequest;

/** Reads the current response part from a kit. */
export declare const useResponse: typeof import('./Capability.d.mts').useResponse;

/** Reads the WebSocket controller from a kit. */
export declare const useWebSocket: typeof import('./Capability.d.mts').useWebSocket;
