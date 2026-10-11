import * as Kit from '@produck/kit';

export const K_WORKFLOW = Symbol('WorkflowKit.Workflow');
export const K_DEPLOYMENT_SELF = Symbol('DeploymentKit.self');
export const K_DEPLOYMENT_SERVER = Symbol('DeploymentKit.server');
export const K_EXCHANGE = Symbol('KittyExchange');

export const { use: useWorkflow } = Kit.Getter(K_WORKFLOW);
export const { use: useServer } = Kit.Getter(K_DEPLOYMENT_SERVER);
export const { use: useExchange, touch: touchExchange } =
  Kit.Getter(K_EXCHANGE);
