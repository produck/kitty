/** Creates a compound workflow class from an implementation. */
export declare const Workflow: typeof import('./CompoundWorkflow/index.d.mts').CompoundWorkflow;

/** Creates a deployer class from an implementation. */
export declare const Deployer: typeof import('./Deployer/index.d.mts').Deployer;

/** Creates a plugin class from an implementation. */
export declare const Plugin: typeof import('./Plugin/index.d.mts').Plugin;

/** Creates exchange classes from an implementation. */
export declare const Exchange: Readonly<{
  /** Creates an HTTP exchange class. */
  Http: typeof import('./Exchange/index.d.mts').Http;

  /** Creates a WebSocket exchange class. */
  WebSocket: typeof import('./Exchange/index.d.mts').WebSocket;
}>;
