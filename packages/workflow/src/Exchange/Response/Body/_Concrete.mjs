import * as Part from '../../Part/index.mjs';
import { EXCHANGE } from './_Borrow.mjs';
import { AdapterGuard } from '../../Utils.mjs';

const GuardNotThrow = {
  bodyDataGet: AdapterGuard({
    message: 'Response body data read failed.',
    member: EXCHANGE._I.RESPONSE.BODY.DATA.GET,
  }),
  bodyDataSet: AdapterGuard({
    message: 'Response body data write failed.',
    member: EXCHANGE._I.RESPONSE.BODY.DATA.SET,
  }),
};

export default class KittyExchangeResponseBody extends Part.Concrete {
  get data() {
    return GuardNotThrow.bodyDataGet(this.exchange);
  }

  set data(value) {
    GuardNotThrow.bodyDataSet(this.exchange, value);
  }
}
