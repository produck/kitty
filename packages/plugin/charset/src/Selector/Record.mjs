import { Is, ThrowTypeError } from '@produck/argot';

const NAME = /^\S+$/;

export function copy(value) {
  return {
    name: value.name,
    mibEnum: value.mibEnum,
    preferredName: value.preferredName,
    aliasList: [...value.aliasList],
  };
}

export function normalizeRecord(_record) {
  if (!Is.PlainObject(_record)) {
    ThrowTypeError('args[0]', 'plain object');
  }

  const record = {};

  const {
    name: _name,
    mibEnum: _mibEnum,
    preferredName: _preferredName,
    aliasList: _aliasList,
  } = _record;

  if (Is.Type.String(_name) && NAME.test(_name)) {
    record.name = _name;
  } else {
    ThrowTypeError('args[0].name', 'non-empty string without whitespace');
  }

  if (Is.PositiveInteger(_mibEnum)) {
    record.mibEnum = _mibEnum;
  } else {
    ThrowTypeError('args[0].mibEnum', 'positive integer');
  }

  if (_preferredName === undefined) {
    record.preferredName = record.name;
  } else if (Is.Type.String(_preferredName) && NAME.test(_preferredName)) {
    record.preferredName = _preferredName;
  } else {
    ThrowTypeError(
      'args[0].preferredName',
      'non-empty string without whitespace',
    );
  }

  if (Is.Instance.Array(_aliasList)) {
    const aliasSet = new Set();

    for (const name of [record.name, record.preferredName, ..._aliasList]) {
      if (!Is.Type.String(name) || !NAME.test(name)) {
        ThrowTypeError('args[0].aliasList', 'an array of alias strings');
      }

      aliasSet.add(name.toLowerCase());
    }

    record.aliasList = Object.freeze([...aliasSet]);
  } else {
    ThrowTypeError('args[0].aliasList', 'an array of alias strings');
  }

  return record;
}

export { normalizeRecord as normalize };
