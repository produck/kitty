import { Is, ThrowTypeError } from '@produck/argot';
import Abstract, { Member as M } from '@produck/es-abstract';

import { I, _I } from './_Symbol.mjs';
import IANA_RECORD_LIST, * as IANA_KEY from './Iana.mjs';

function copyRecord(record) {
  const name = record[IANA_KEY.NAME] ?? record.name;
  const mibEnum = record[IANA_KEY.MIB_ENUM] ?? record.mibEnum;
  const preferredName = record[IANA_KEY.PREFERRED_NAME] ?? record.preferredName;
  const aliasList = record[IANA_KEY.ALIAS_LIST] ?? record.aliasList;

  return {
    name,
    mibEnum,
    preferredName: preferredName ?? name,
    aliasList: aliasList.includes(name) ? [...aliasList] : [name, ...aliasList],
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

function assertRecord(_record) {
  if (!Is.PlainObject(_record)) {
    ThrowTypeError('extended record', 'plain object');
  }

  const { name, mibEnum, preferredName, aliasList } = _record;

  if (!Is.Type.String(name) || name.trim().length === 0) {
    ThrowTypeError('extended record.name', 'non-empty string');
  }

  if (!Is.PositiveInteger(mibEnum)) {
    ThrowTypeError('extended record.mibEnum', 'positive integer');
  }

  if (preferredName !== undefined && !Is.Type.String(preferredName)) {
    ThrowTypeError('extended record.preferredName', 'string');
  }

  if (!Is.Instance.Array(aliasList)) {
    ThrowTypeError('extended record.aliasList', 'an array of strings');
  }

  for (const alias of aliasList) {
    if (!Is.Type.String(alias)) {
      ThrowTypeError('extended record.aliasList', 'an array of strings');
    }
  }
}

class Selector {
  *[I.IANA]() {
    for (const record of IANA_RECORD_LIST) {
      yield copyRecord(record);
    }
  }

  *[_I.EXTEND]() {
    yield* [];
  }

  *[I.ENTRIES]() {
    yield* this[I.IANA]();

    for (const _record of this[_I.EXTEND]()) {
      assertRecord(_record);

      yield copyRecord(_record);
    }
  }

  findByName(name) {
    if (!Is.Type.String(name)) {
      ThrowTypeError('args[0] as name', 'string');
    }

    const target = normalizeText(name);

    for (const record of this[I.ENTRIES]()) {
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

    for (const record of this[I.ENTRIES]()) {
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

    for (const record of this[I.ENTRIES]()) {
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

    for (const record of this[I.ENTRIES]()) {
      if (hasAlias(record, alias)) {
        return record;
      }
    }

    return null;
  }
}

export default Abstract(
  Selector,
  Abstract({ [_I.EXTEND]: M.Method().returns(M.Iterable) }),
);
