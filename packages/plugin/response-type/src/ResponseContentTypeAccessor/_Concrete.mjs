import { Is, Ow, ThrowTypeError } from '@produck/argot';

import { I } from './_Symbol.mjs';

const CONTENT_TYPE = 'content-type';
const TOKEN = /^\S+$/;

export default class ResponseContentTypeAccessor {
  constructor(exchange, typeTable, charset) {
    this[I.EXCHANGE] = exchange;
    this[I.TYPE_TABLE] = typeTable;
    this[I.CHARSET] = charset;
  }

  set(mediaType, _charsetName) {
    if (!Is.Type.String(mediaType) || !TOKEN.test(mediaType)) {
      ThrowTypeError('args[0] as mediaType', 'non-empty string without space');
    }

    if (
      _charsetName !== undefined &&
      (!Is.Type.String(_charsetName) || !TOKEN.test(_charsetName))
    ) {
      ThrowTypeError(
        'args[1] as charsetName',
        'non-empty string without space',
      );
    }

    const item = this[I.RESOLVE_ITEM](mediaType);
    const charsetName = this[I.RESOLVE_CHARSET](item, _charsetName);

    this[I.WRITE](item.mimeType, charsetName);
  }

  [I.RESOLVE_ITEM](mediaType) {
    const target = mediaType.trim().toLowerCase();
    const itemList = target.includes('/')
      ? this[I.TYPE_TABLE].findByMimeType(target)
      : this[I.TYPE_TABLE].findByAlias(target);

    if (itemList.length === 0) {
      Ow.Error.Common(`The media type "${mediaType}" is NOT registered.`);
    }

    if (itemList.length > 1) {
      Ow.Error.Common(
        `The alias "${mediaType}" answers ${itemList.length} media types.`,
      );
    }

    return itemList[0];
  }

  [I.RESOLVE_CHARSET](item, charsetName) {
    if (charsetName === undefined) {
      return null;
    }

    const { mimeType, charsetList } = item;
    const record = this[I.CHARSET].findByAlias(charsetName);

    if (record === null) {
      Ow.Error.Common(`The charset "${charsetName}" is NOT registered.`);
    }

    if (!charsetList.includes(record.mibEnum)) {
      Ow.Error.Common(
        `The media type "${mimeType}" does not accept the charset "${charsetName}".`,
      );
    }

    return record.preferredName;
  }

  [I.WRITE](mediaType, charsetName) {
    const segmentList = [mediaType];

    if (charsetName !== null) {
      segmentList.push(`charset=${charsetName.toLowerCase()}`);
    }

    this[I.EXCHANGE].response.header.set(CONTENT_TYPE, segmentList.join('; '));
  }
}
