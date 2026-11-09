import { ThrowTypeError } from '@produck/argot';

import { Concrete as Selector } from './Selector/index.mjs';

const SELECTOR_MAP = new WeakMap();

export function installSelector(workflow) {
  const selector = new Selector();

  SELECTOR_MAP.set(workflow, selector);

  return selector;
}

export function getSelector(workflow) {
  if (!SELECTOR_MAP.has(workflow)) {
    ThrowTypeError('args[0] as workflow', 'installed workflow');
  }

  return SELECTOR_MAP.get(workflow);
}
