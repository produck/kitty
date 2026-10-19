import { Ow, SYMBOL, ThrowTypeError } from '@produck/argot';

import * as HttpExchange from '../../HttpExchange/index.mjs';
import { DATA_NORMALIZER } from './_Borrow.mjs';
import { I, $I } from './_Symbol.mjs';

const DataNormalizer = HttpExchange.Response.Body.DataNormalizer.Abstract;

export default class DataNormalizerRegistry {
  [I.NORMALIZER_MAP] = new Map();

  register(normalizer) {
    if (!(normalizer instanceof DataNormalizer)) {
      ThrowTypeError('args[0]', 'a ResponseBodyDataNormalizer');
    }

    const Constructor = normalizer[SYMBOL.CONSTRUCTOR];

    if (this[I.NORMALIZER_MAP].has(Constructor)) {
      Ow.Error.Common(`Normalizer(${Constructor.name}) exists.`);
    }

    this[I.NORMALIZER_MAP].set(Constructor, normalizer);

    return this;
  }

  [$I.NORMALIZE](value) {
    for (const normalizer of this[I.NORMALIZER_MAP].values()) {
      if (normalizer[DATA_NORMALIZER.$I.TEST](value)) {
        return normalizer[DATA_NORMALIZER.$I.NORMALIZE](value);
      }
    }

    const names = [...this[I.NORMALIZER_MAP].keys()]
      .map(({ name }) => name)
      .join(' | ');

    Ow.Error.Common(`No registered normalizer accepts it. ${names}`);
  }
}
