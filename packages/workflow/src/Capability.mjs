import * as Kit from '@produck/kit';

import * as Workflow from './Workflow/index.mjs';
import * as Deployment from './Workflow/Deployment/index.mjs';
import * as Exchange from './Workflow/Exchange/index.mjs';
import * as WebSocketExchange from './CompoundWorkflow/WebSocketExchange/index.mjs';

export const { use: useWorkflow } = Kit.Getter(Workflow.K_WORKFLOW);
export const { use: useServer } = Kit.Getter(Deployment.K_DEPLOYMENT_SERVER);
export const { use: useExchange } = Kit.Getter(Exchange.K_EXCHANGE);
export const { use: useRequest } = Kit.Getter(Exchange.K_REQUEST);
export const { use: useResponse } = Kit.Getter(Exchange.K_RESPONSE);
export const { use: useWebSocket } = Kit.Getter(WebSocketExchange.K_CONTROLLER);
