import type * as Kit from '@produck/kit';
import type * as net from 'node:net';

import type * as Deployment from '../Workflow/Deployment/index.d.mts';
import type * as Deployer from './Deployer/index.d.mts';
import type * as DeployerRegistry from './DeployerRegistry/index.d.mts';
import type * as Plugin from './Plugin/index.d.mts';
import type * as _Symbol from './_Symbol.d.mts';

/**
 * Normalized response body. When `stream` is `null`, `length` must be `0`.
 */
export interface ResponseBodyData {
  /** Response body stream; `null` for an empty body. */
  stream: ReadableStream | null;

  /** Byte length; `null` when unknown, `0` for an empty body. */
  length: number | null;
}

/** Pipeline handler: receives the context and `next`; arity must not exceed 2. */
export interface Handler {
  /**
   * @param context - Value handed to the pipeline.
   * @param next - Continues to the next handler.
   * @returns Whatever the handler returns, propagated to the caller.
   */
  (context: unknown, next: () => unknown): unknown;
}

/**
 * Handle returned by `pickDeployer()`; call exactly one of `compile` /
 * `deploy`, once.
 */
export interface OneTimeDeployer {
  /**
   * Compile only: returns the deployment without touching the server.
   *
   * @param server - Target server instance.
   * @returns The deployment produced by compilation.
   */
  compile(server: net.Server): Promise<Deployment.Concrete>;

  /**
   * Compile and start listening on the server.
   *
   * @param server - Target server to listen on.
   * @returns Resolves once the server is listening.
   */
  deploy(server: net.Server): Promise<void>;
}

/**
 * Compound workflow: pipeline, plugin, configuration and deployment entry.
 * Declares the response body normalization slot; unusable until implemented.
 */
declare abstract class CompoundWorkflow {
  /**
   * @param externalKit - Kit to build on; omit to create a fresh one.
   */
  constructor(externalKit?: Kit.KitProvider);

  /**
   * Deployer registry owned by this workflow instance.
   */
  readonly DeployerRegistry: DeployerRegistry.Concrete;

  /** Whether it is finalized; `use` / `mountPlugin` are rejected afterwards. */
  readonly isFinalized: boolean;

  /**
   * Appends handlers and returns `this` for chaining.
   *
   * @param handlerList - Handlers to append.
   * @returns This workflow.
   */
  use(...handlerList: Handler[]): this;

  /**
   * Freezes the handler list and finishes composition; the instance is done.
   *
   * @returns This workflow.
   */
  finalize(): this;

  /**
   * Installs a plugin; allowed only before finalize.
   *
   * @param plugin - Plugin class to install.
   * @returns This workflow.
   */
  mountPlugin(plugin: Plugin.Class): this;

  /**
   * Compiles and returns the deployment without connecting to the server.
   *
   * @param server - Target server instance.
   * @returns The deployment produced by compilation.
   */
  compile(server: net.Server): Promise<Deployment.Concrete>;

  /**
   * Compiles and starts listening on the server.
   *
   * @param server - Target server to listen on.
   * @returns Resolves once the server is listening.
   */
  deploy(server: net.Server): Promise<void>;

  /**
   * Mounts a deployer class for this instance; duplicates throw.
   *
   * @param deployer - Deployer class to mount.
   * @returns This workflow.
   */
  mountDeployer(deployer: Deployer.Class): this;

  /**
   * Picks a deployer for a single deployment, bypassing the mounted registry.
   *
   * @param deployer - Deployer class used for this one deployment.
   * @returns A one-time handle; call exactly one of `compile` / `deploy`.
   */
  pickDeployer(deployer: Deployer.Class): OneTimeDeployer;

  /**
   * Sets the request body distributor constructor; allowed after finalize.
   *
   * @param Constructor - Distributor constructor to use.
   * @returns This workflow.
   */
  setRequestBodyDistributorConstructor(
    Constructor: abstract new (...args: never[]) => unknown,
  ): this;

  /**
   * Implementation: normalizes a body value into `{ stream, length }`.
   *
   * @param value - Raw body value supplied by the handler.
   * @returns Normalized body data.
   */
  [_Symbol._I.NORMALIZE_HTTP_RESPONSE_BODY_DATA](
    value: unknown,
  ): ResponseBodyData;
}

export { CompoundWorkflow as Abstract };
