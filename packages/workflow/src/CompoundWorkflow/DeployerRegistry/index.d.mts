import type * as Deployer from '../Deployer/index.d.mts';

/**
 * Per-workflow-class deployer registry: maps server constructors and one-time
 * server instances to deployer classes. Each workflow class owns its own
 * instance, so classes never see each other's registrations.
 */
declare class DeployerRegistry {
  /**
   * Registers a deployer class by server constructor; duplicates throw.
   *
   * @param DeployerClass - Deployer class to register.
   */
  register(DeployerClass: Deployer.Class): void;

  /**
   * Reports whether the server has a usable deployer.
   *
   * @param value - Candidate server instance.
   * @returns `true` when a deployer is registered for it.
   */
  isAvaiableServer(value: unknown): boolean;
}

export { DeployerRegistry as Concrete };
