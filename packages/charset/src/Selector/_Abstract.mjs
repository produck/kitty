import { Is, ThrowTypeError } from '@produck/argot';
import Abstract, { Member as M } from '@produck/es-abstract';

import { I, _I } from './_Symbol.mjs';
import IANA_RECORD_LIST from './Iana.mjs';

function copyRecord(record) {
  return {
    name: record.name,
    mibEnum: record.mibEnum,
    preferredName: record.preferredName,
    aliasList: [...record.aliasList],
  };
}

function normalizeText(value) {
  return value.trim().toLowerCase();
}

function hasAlias(record, alias) {
  const target = normalizeText(alias);

  return record.aliasList.some((item) => {
    return item.toLowerCase() === target;
  });
}

class Selector {
  *[I.IANA]() {
    for (const record of IANA_RECORD_LIST) {
      yield copyRecord(record);
    }
  }

  *[_I.EXTRA]() {
    yield* [];
  }

  *[I.ITERATE]() {
    yield* this[I.IANA]();
    yield* this[_I.EXTRA]();
  }

  findByName(name) {
    if (!Is.Type.String(name)) {
      ThrowTypeError('args[0] as name', 'string');
    }

    const target = normalizeText(name);

    for (const record of this[I.ITERATE]()) {
      if (record.name.toLowerCase() === target) {
        return record;
      }
    }

    return null;
  }

  findByMibEnum(mibEnum) {
    if (!Is.PositiveInteger(mibEnum)) {
      ThrowTypeError('args[0] as mibEnum', 'positive integer');
    }

    for (const record of this[I.ITERATE]()) {
      if (record.mibEnum === mibEnum) {
        return record;
      }
    }

    return null;
  }

  findByPreferredName(name) {
    if (!Is.Type.String(name)) {
      ThrowTypeError('args[0] as preferredName', 'string');
    }

    const target = normalizeText(name);

    for (const record of this[I.ITERATE]()) {
      if (record.preferredName.toLowerCase() === target) {
        return record;
      }
    }

    return null;
  }

  findByAlias(alias) {
    if (!Is.Type.String(alias)) {
      ThrowTypeError('args[0] as alias', 'string');
    }

    for (const record of this[I.ITERATE]()) {
      if (hasAlias(record, alias)) {
        return record;
      }
    }

    return null;
  }
}

export default Abstract(
  Selector,
  Abstract({ [_I.EXTRA]: M.Method().returns(M.Iterable) }),
);
