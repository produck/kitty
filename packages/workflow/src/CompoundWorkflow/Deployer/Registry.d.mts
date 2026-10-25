import type * as net from 'node:net';

import type * as Deployer from './index.d.mts';

/**
 * Registers a deployer class by server constructor; duplicates throw.
 *
 * @param DeployerClass - Deployer class to register.
 */
export declare function registerDeployer(DeployerClass: Deployer.Class): void;

/**
 * Asserts the value is a deployer class; throws otherwise.
 *
 * @param value - Candidate value.
 */
export declare function assertDeployer(value: unknown): void;

/**
 * Reports whether the server has a usable deployer.
 *
 * @param value - Candidate server instance.
 * @returns `true` when a deployer is registered for it.
 */
export declare function isAvaiableServer(value: unknown): boolean;

/**
 * Looks up the one-time association first, then resolves the deployer class by
 * server constructor.
 *
 * @param server - Server instance to resolve.
 * @returns The deployer class, or `undefined` when none is registered.
 */
export declare function getByServer(
  server: net.Server,
): Deployer.Class | undefined;

/**
 * Associates a one-time deployment server with a deployer class.
 *
 * @param server - Server instance of the one-time deployment.
 * @param DeployerClass - Deployer class to associate.
 */
export declare function associate(
  server: net.Server,
  DeployerClass: Deployer.Class,
): void;
