import {
  Tune,
  useExchange,
  useRequest,
  useResponse,
} from '@produck/kitty-workflow';

import { createDeployer } from './Deployer.mjs';
import { createInternal } from './Internal.mjs';
import { createWorkflow } from './Workflow.mjs';

const PIPELINE_TYPES = [
  'exchange-pipeline-done',
  'exchange-pipeline-error',
  'exchange-pipeline-finish',
];

export async function dispatch(options = {}) {
  const {
    kind = 'http',
    internal: patch = {},
    deployer: deployerOptions = {},
    setup = null,
    handler = null,
    timeout = 500,
    config = {},
  } = options;

  const state = {
    events: [],
    exchange: null,
    exchangeKit: null,
    installError: null,
    request: null,
    response: null,
    workflow: null,
  };

  const fixture = createDeployer({
    ...deployerOptions,
    webSocket: kind === 'websocket' || deployerOptions.webSocket === true,
    install: (kit) => {
      kit.appendExchangeAttacher((ExchangeKit) => {
        const exchange = useExchange(ExchangeKit);

        state.exchange = exchange;
        state.exchangeKit = ExchangeKit;
        state.request = useRequest(ExchangeKit);
        state.response = useResponse(ExchangeKit);

        for (const type of PIPELINE_TYPES) {
          exchange.addEventListener(type, (event) => {
            state.events.push({ type, detail: event.detail });
          });
        }

        if (setup !== null) {
          setup(state);
        }
      });

      if (deployerOptions.install !== undefined) {
        deployerOptions.install(kit);
      }
    },
  });

  const workflow = createWorkflow();

  Tune.MaxExchangeTimeout(workflow, timeout);

  for (const [key, value] of Object.entries(config)) {
    Tune[key](workflow, value);
  }

  if (handler !== null) {
    workflow.use(handler);
  }

  workflow.finalize();

  const server = new fixture.Server();

  await workflow.deploy(server);

  state.workflow = workflow;
  state.server = server;
  state.fixture = fixture;
  state.internal = createInternal({ server, ...patch });

  const kit = fixture.installLog[0];

  try {
    if (kind === 'websocket') {
      await kit.handleWebSocketExchange(state.internal);
    } else {
      await kit.handleHttpExchange(state.internal);
    }
  } catch (error) {
    state.installError = error;
  }

  return state;
}

export function pipelineEvents(state) {
  return state.events.map(({ type }) => type.replace('exchange-pipeline-', ''));
}

export function eventTypes(state) {
  return state.events.map(({ type }) => type);
}
