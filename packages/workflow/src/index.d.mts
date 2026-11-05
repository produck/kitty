/**
 * All abstract classes. Implementers extend them; the framework ships no
 * ready-to-use products.
 */
export declare const Abstract: Readonly<{
  Workflow: typeof import('./CompoundWorkflow/index.d.mts').Abstract;
  Deployer: typeof import('./CompoundWorkflow/Deployer/index.d.mts').Abstract;
  Plugin: typeof import('./CompoundWorkflow/Plugin/index.d.mts').Abstract;
  Exchange: typeof import('./Workflow/Exchange/index.d.mts').Abstract;
  ExchangeRequest: typeof import('./Workflow/Exchange/Request/index.d.mts').Abstract;
  ExchangeRequestHeader: typeof import('./Workflow/Exchange/Request/Header/index.d.mts').Abstract;
  ExchangeResponse: typeof import('./Workflow/Exchange/Response/index.d.mts').Abstract;
  ExchangeResponseHeader: typeof import('./Workflow/Exchange/Response/Header/index.d.mts').Abstract;
  ExchangeMutableResponse: typeof import('./Workflow/Exchange/MutableResponse/index.d.mts').Abstract;
  ExchangeMutableHeader: typeof import('./Workflow/Exchange/Response/MutableHeader/index.d.mts').Abstract;
  HttpExchange: typeof import('./CompoundWorkflow/HttpExchange/index.d.mts').Abstract;
  HttpRequest: typeof import('./CompoundWorkflow/HttpExchange/Request/index.d.mts').Abstract;
  HttpRequestBody: typeof import('./CompoundWorkflow/HttpExchange/Request/Body/index.d.mts').Abstract;
  HttpResponse: typeof import('./CompoundWorkflow/HttpExchange/Response/index.d.mts').Abstract;
  HttpResponseBody: typeof import('./CompoundWorkflow/HttpExchange/Response/Body/index.d.mts').Abstract;
  WebSocketExchange: typeof import('./CompoundWorkflow/WebSocketExchange/index.d.mts').Abstract;
  WebSocketController: typeof import('./CompoundWorkflow/WebSocketExchange/Controller/index.d.mts').Abstract;
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

  /** Kit the deployer writes its deployment definition through. */
  type DeployerKit =
    import('./CompoundWorkflow/Deployer/index.d.mts').DeployerKit;

  /** One link in the server linker stack. */
  type ServerLinker =
    import('./CompoundWorkflow/Deployer/index.d.mts').ServerLinker;

  /** Attacher invoked once with each ExchangeKit at request time. */
  type ExchangeAttacher =
    import('./CompoundWorkflow/Deployer/index.d.mts').ExchangeAttacher;

  /** Kit the plugin attaches its capabilities through. */
  type PluginKit = import('./CompoundWorkflow/Plugin/index.d.mts').PluginKit;

  /** Attacher invoked once with each DeploymentKit. */
  type DeploymentAttacher =
    import('./CompoundWorkflow/Plugin/index.d.mts').DeploymentAttacher;
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

  /** Static slots of the HTTP exchange. */
  HTTP_EXCHANGE: Readonly<{
    _S: typeof import('./CompoundWorkflow/HttpExchange/_Symbol.d.mts')._S;
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

export declare const Tune: typeof import('./CompoundWorkflow/Configuration/index.d.mts').Tune;

export declare const Get: typeof import('./CompoundWorkflow/Configuration/index.d.mts').Get;

/** Capability namespace keyed by part: `Use.Server`, `Use.Exchange`, ... */
export declare const Use: typeof import('./Use.d.mts');

/** Implementation definer: hands out a whole set of constructors at once. */
export declare const Implement: typeof import('./Implement/index.d.mts');

export declare const useWorkflow: typeof import('./Capability.d.mts').useWorkflow;

export declare const useServer: typeof import('./Capability.d.mts').useServer;

export declare const useExchange: typeof import('./Capability.d.mts').useExchange;

export declare const useRequest: typeof import('./Capability.d.mts').useRequest;

export declare const useResponse: typeof import('./Capability.d.mts').useResponse;

export declare const useWebSocket: typeof import('./Capability.d.mts').useWebSocket;
