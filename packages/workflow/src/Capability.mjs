import * as Kit from '@produck/kit';

export const K_WORKFLOW = Symbol('WorkflowKit.Workflow');
export const K_DEPLOYMENT_SERVER = Symbol('DeploymentKit.server');
export const K_EXCHANGE = Symbol('KittyExchange.exchange');

export const { use: useWorkflow } = Kit.Getter(K_WORKFLOW);
export const { use: useServer } = Kit.Getter(K_DEPLOYMENT_SERVER);
export const { use: useExchange } = Kit.Getter(K_EXCHANGE);
