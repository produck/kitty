import * as Adapter from './Adapter/index.mjs';
import { defineMixin } from './Mixin/index.mjs';
import { useServer, useWorkflow } from './Abstract.mjs';
import { CompoundKittyWorkflow } from './Compound.mjs';

import {
  useExchange,
  Abstract as AbstractExchange,
  Implement as defineExchange,
  Configuration,
} from './Exchange/index.mjs';

const {
  getByServer: getAdapterByServer,
  registerAdapter,
  normalizeOptions: defineAdapter,
} = Adapter.Registry;

const { tuneTimeout: tuneExchangeTimeout } = Configuration;

export {
  useWorkflow,
  useServer,
  useExchange,
  defineExchange,
  defineAdapter,
  defineMixin,
  CompoundKittyWorkflow as Workflow,
  AbstractExchange,
  getAdapterByServer,
  registerAdapter,
  tuneExchangeTimeout,
};
