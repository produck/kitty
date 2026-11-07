import { Is, ThrowTypeError } from '@produck/argot';

import { I } from './_Symbol.mjs';

export default class RequestContentTypeAccessor {
  constructor(exchange, typeTable) {
    this[I.EXCHANGE] = exchange;
    this[I.TYPE_TABLE] = typeTable;
  }

  is(...patternList) {
    if (patternList.length === 0) {
      ThrowTypeError('args', 'non-empty pattern list');
    }

    for (const [index, value] of patternList.entries()) {
      if (!Is.Type.String(value) || value.trim().length === 0) {
        ThrowTypeError(`args[${index}] as pattern`, 'non-empty string');
      }
    }

    const parsedMediaType = this[I.PARSED_MEDIA_TYPE];

    if (parsedMediaType === null) {
      return false;
    }

    for (const pattern of patternList) {
      const finalPattern = pattern.trim().toLowerCase();

      if (this[I.MATCH](parsedMediaType, finalPattern)) {
        return finalPattern;
      }
    }

    return false;
  }

  get [I.PARSED_MEDIA_TYPE]() {
    const _value = this[I.EXCHANGE].request.header.get('content-type');

    if (typeof _value !== 'string') {
      return null;
    }

    const mediaType = _value.split(';', 1)[0].trim().toLowerCase();
    const slash = mediaType.indexOf('/');

    if (slash <= 0 || slash === mediaType.length - 1) {
      return null;
    }

    return {
      mediaType,
      type: mediaType.slice(0, slash),
      subtype: mediaType.slice(slash + 1),
    };
  }

  [I.MATCH](parsedMediaType, pattern) {
    const { mediaType, type, subtype } = parsedMediaType;

    if (pattern === '*/*') {
      return true;
    }

    if (pattern.startsWith('+')) {
      return subtype.endsWith(pattern);
    }

    if (pattern.endsWith('/*')) {
      return type === pattern.slice(0, -2);
    }

    if (pattern.includes('/')) {
      return mediaType === pattern;
    }

    const itemList = this[I.TYPE_TABLE].findByAlias(pattern);

    return itemList.some(({ mimeType }) => mimeType === mediaType);
  }
}
