import type * as Deployer from '../Deployer/index.d.mts';

/**
 * Per-workflow-instance deployer registry: maps server constructors to
 * deployer classes. Each workflow instance owns its own registry, so the set
 * of supported deployments is an instance decision.
 */
declare class DeployerRegistry {
  /**
   * Registers a deployer class by server constructor; duplicates throw.
   *
   * @param DeployerClass - Deployer class to register.
   */
  register(DeployerClass: Deployer.Class): void;
}

export { DeployerRegistry as Concrete };
