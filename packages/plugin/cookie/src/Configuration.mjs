import { Is, ThrowTypeError } from '@produck/argot';
import { deepFreeze } from '@produck/deep-freeze-enumerable';

import * as Bridge from './Bridge.mjs';

const AV_OCTETS = /^[\x21-\x3a\x3c-\x7e]+$/;

function configurationOf(workflow) {
  if (!Bridge.hasConfiguration(workflow)) {
    ThrowTypeError('args[0] as workflow', 'installed workflow');
  }

  return Bridge.getConfiguration(workflow);
}

function Domain(value) {
  if (value === null || (Is.Type.String(value) && AV_OCTETS.test(value))) {
    return value;
  }

  ThrowTypeError('args[1]', 'null | non-empty string of av-octet characters');
}

function MaxAge(value) {
  if (value === null || Number.isInteger(value)) {
    return value;
  }

  ThrowTypeError('args[1]', 'null | integer in seconds');
}

function Expires(value) {
  if (
    value === null ||
    (Is.Instance.Date(value) && !Number.isNaN(value.getTime()))
  ) {
    return value;
  }

  ThrowTypeError('args[1]', 'null | valid Date');
}

const ITEM_LIST = [
  { name: 'Domain', key: 'domain', assert: Domain },
  { name: 'MaxAge', key: 'maxAge', assert: MaxAge },
  { name: 'Expires', key: 'expires', assert: Expires },
];

const TUNE = {};
const GET = {};

for (const { name, key, assert } of ITEM_LIST) {
  TUNE[name] = (workflow, value) => {
    assert(value);
    configurationOf(workflow)[key] = value;
  };

  GET[name] = (workflow) => configurationOf(workflow)[key];
}

export const Tune = deepFreeze(TUNE);
export const Get = deepFreeze(GET);

export function installConfiguration(workflow) {
  const configuration = { domain: null, maxAge: null, expires: null };

  Bridge.setConfiguration(workflow, configuration);

  return configuration;
}
