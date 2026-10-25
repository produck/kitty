import type * as net from 'node:net';

import type * as DeployerSubject from '../../CompoundWorkflow/Deployer/index.d.mts';
import type * as Exchange from '../Exchange/index.d.mts';

/** Deployer implementation options. */
export interface Options {
  /** Deployer tag; diagnostics only. */
  tag: string;

  /** Target server constructor; also the registry key. */
  server: abstract new (...args: never[]) => net.Server;

  /** Exchange classes this deployer serves. */
  exchange: {
    /** HTTP exchange class (required). */
    http: Exchange.HttpClass;

    /** WebSocket exchange class; omit when unsupported. */
    webSocket?: Exchange.WebSocketClass;
  };

  /**
   * Writes the deployment definition; receives the deployment kit.
   *
   * @param deployerKit - Kit the deployer writes its definitions into.
   */
  install(deployerKit: DeployerSubject.DeployerKit): void;
}

/**
 * Creates a deployer class from the given implementation.
 *
 * @param options - Implementation to wrap.
 * @returns A deployer class.
 */
export declare function Deployer(options: Options): DeployerSubject.Class;
