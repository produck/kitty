import { Unit } from '@produck/argot';

import * as Assert from '../../Exchange/Parser.mjs';

export default [
  {
    key: 'MaxExchangeTimeout',
    default: 2 * Unit.Time.MIN,
    assert: Assert.PositiveInteger,
  },
  {
    key: 'MaxBodySize',
    default: Unit.Byte.MB,
    assert: Assert.PositiveInteger,
  },
  {
    key: 'MaxRequestBodyBuffer',
    default: 4 * Unit.Byte.KB,
    assert: Assert.NonNegativeInteger,
  },
  {
    key: 'AllowedBodyMethods',
    default: ['POST', 'PUT', 'PATCH'],
    assert: Assert.HttpMethodList,
  },
];
