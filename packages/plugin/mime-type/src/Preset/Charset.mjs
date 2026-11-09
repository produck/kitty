import * as Meta from '@produck/meta-iana-charset';

export const ANY = Object.freeze(
  Object.values(Meta.data)
    .map((record) => record.mibEnum)
    .sort((left, right) => left - right),
);
