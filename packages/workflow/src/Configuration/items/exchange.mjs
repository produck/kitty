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
    key: 'AllowedBodyMethods',
    default: ['POST', 'PUT', 'PATCH'],
    assert: Assert.HttpMethodList,
  },
];
