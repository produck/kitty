import { Readable } from 'node:stream';

import { SYMBOL } from '@produck/argot';
import Abstract, { Member as M } from '@produck/es-abstract';
import { SubConstructorOf } from '@produck/es-abstract-member-constructor';
import * as Fugue from '@produck/fugue';

import { I, _I, _S } from './_Symbol.mjs';
import { PART } from './_Borrow.mjs';
import * as Part from '../../Part/index.mjs';

class AbstractRequestBody extends Part.Concrete {
  [I.DISTRIBUTOR] = null;

  constructor(exchange) {
    super(exchange);

    const TargetConstructor = this[SYMBOL.CONSTRUCTOR];
    const source = Readable.toWeb(this[_I.SOURCE.GET](this[PART.$I.INTERNAL]));
    const distributor = new TargetConstructor[_S.DISTRIBUTOR_CTOR](source);

    this[I.DISTRIBUTOR] = distributor;
  }

  get data() {
    return this[I.DISTRIBUTOR].fork();
  }
}

export default Abstract(
  AbstractRequestBody,
  Abstract({
    [_I.SOURCE.GET]: M.Method().args(M.Any).returns(M.Instance(Readable)),
  }),
  Abstract.Static({
    [_S.DISTRIBUTOR_CTOR]: SubConstructorOf(Fugue.Distributor),
  }),
);
