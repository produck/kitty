import { Unit } from '@produck/argot';

import * as P from './_Parser.mjs';

export default [
  {
    key: 'MaxExchangeTimeout',
    default: 2 * Unit.Time.MIN,
    assert: P.PositiveInteger,
  },
  {
    key: 'MaxBodySize',
    default: Unit.Byte.MB,
    assert: P.PositiveInteger,
  },
  {
    key: 'AllowedBodyMethods',
    default: ['POST', 'PUT', 'PATCH'],
    assert: P.HttpMethodList,
  },
];
