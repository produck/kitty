import { ThrowTypeError } from '@produck/argot';

import ItemDistributor from './items/distributor.mjs';
import ItemExchange from './items/exchange.mjs';

export const Item = {
  Distributor: ItemDistributor,
  Exchange: ItemExchange,
};

const items = [...Item.Exchange, ...Item.Distributor];
const mapWorkflowToConfiguration = new WeakMap();

const TUNE = {};
const GET = {};

function configurationOf(workflow) {
  if (!mapWorkflowToConfiguration.has(workflow)) {
    ThrowTypeError('args[0] as workflow', 'Workflow');
  }

  return mapWorkflowToConfiguration.get(workflow);
}

for (const { key, assert } of items) {
  TUNE[`tune${key}`] = (workflow, value) => {
    assert(value);
    configurationOf(workflow)[key] = value;
  };

  GET[`get${key}`] = (workflow) => configurationOf(workflow)[key];
}

export const Tune = Object.freeze(TUNE);
export const Get = Object.freeze(GET);

export function installConfiguration(workflow) {
  const configuration = {};

  for (const { key, default: _default } of items) {
    configuration[key] = _default;
  }

  mapWorkflowToConfiguration.set(workflow, configuration);

  return configuration;
}

export { installConfiguration as install };
