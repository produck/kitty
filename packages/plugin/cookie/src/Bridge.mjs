import { Concrete as ExchangeCookie } from './ExchangeCookie/index.mjs';

const INSTANCE_MAP = new WeakMap();
const CONFIGURATION_MAP = new WeakMap();

export function getCookie(exchange) {
  if (!INSTANCE_MAP.has(exchange)) {
    INSTANCE_MAP.set(exchange, new ExchangeCookie(exchange));
  }

  return INSTANCE_MAP.get(exchange);
}

export function hasConfiguration(workflow) {
  return CONFIGURATION_MAP.has(workflow);
}

export function getConfiguration(workflow) {
  return CONFIGURATION_MAP.get(workflow);
}

export function setConfiguration(workflow, configuration) {
  CONFIGURATION_MAP.set(workflow, configuration);
}
