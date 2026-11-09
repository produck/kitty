import * as MetaIanaCharset from '@produck/meta-iana-charset';

function toRecord(record) {
  const aliasList = record.aliasList.includes(record.name)
    ? record.aliasList
    : [record.name, ...record.aliasList];

  return {
    name: record.name,
    mibEnum: record.mibEnum,
    preferredName: record.preferredAlias ?? record.name,
    aliasList,
  };
}

const IANA_RECORD_LIST = Object.values(MetaIanaCharset.data)
  .map(toRecord)
  .sort((left, right) => left.mibEnum - right.mibEnum);

export default IANA_RECORD_LIST;
