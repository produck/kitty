export declare const Workflow: typeof import('./CompoundWorkflow/index.d.mts').CompoundWorkflow;

export declare const Deployer: typeof import('./Deployer/index.d.mts').Deployer;

export declare const Plugin: typeof import('./Plugin/index.d.mts').Plugin;

/** Creates exchange classes from an implementation. */
export declare const Exchange: Readonly<{
  Http: typeof import('./Exchange/index.d.mts').Http;
  WebSocket: typeof import('./Exchange/index.d.mts').WebSocket;
}>;

/** Normalizes implementation options; mirrors the factories above. */
export declare const Normalize: typeof import('./Normalize/index.d.mts');
