import type * as Kit from '@produck/kit';
import type * as net from 'node:net';

import type * as Workflow from '../../CompoundWorkflow/index.d.mts';

/** Deployment constructor options. */
export interface DeploymentOptions {
  /** Server instance of this deployment. */
  server: net.Server;

  /** Deployment kit name; debug only. */
  kitName?: string;
}

/** Server instance port on the DeploymentKit. */
export declare const K_DEPLOYMENT_SERVER: unique symbol;

/**
 * Product of one compilation: holds the manifest and the linker chain.
 * The public face is only `manifest` and `link()`.
 */
declare class Deployment {
  /**
   * @param workflowKit - Kit of the owning workflow.
   * @param workflow - Workflow being deployed.
   * @param options - Deployment options.
   */
  constructor(
    workflowKit: Kit.KitProvider,
    workflow: Workflow.Abstract,
    options: DeploymentOptions,
  );

  /** Material records declared by the deployer; what `compile()` consumes. */
  readonly manifest: Record<string, unknown>;

  /** Runs the linker chain; call once, a second call throws. */
  link(): void;
}

export { Deployment as Concrete };
