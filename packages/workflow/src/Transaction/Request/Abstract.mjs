import Abstract, { Member as M } from '@produck/es-abstract';
import { _I } from './Symbol.mjs';

class RequestHeader {
  #request;

  constructor(request) {
    this.#request = request;
  }

  get(key) {
    return this.#request[_I.HEADER.GET](key);
  }

  has(key) {
    return this.#request[_I.HEADER.HAS](key);
  }

  keys() {
    return this.#request[_I.HEADER.KEYS]();
  }

  entries() {
    return this.#request[_I.HEADER.ENTRIES]();
  }
}

class RequestBody {
  #request;

  constructor(request) {
    this.#request = request;
  }

  get data() {
    return this.#request[_I.BODY.DATA.GET]();
  }
}

export default Abstract(
  class Request {
    header = new RequestHeader(this);
    body = new RequestBody(this);

    constructor() {
      Object.freeze(this);
    }
  },
  ...[
    Abstract({
      [_I.HEADER.GET]: M.Method().args(M.String).returns(M.Any),
      [_I.HEADER.HAS]: M.Method().args(M.String).returns(M.Boolean),
      [_I.HEADER.KEYS]: M.Method().returns(M.Any),
      [_I.HEADER.ENTRIES]: M.Method().returns(M.Any),
      [_I.BODY.DATA.GET]: M.Method().returns(M.Any),
    }),
  ],
);

export { RequestHeader as Header, RequestBody as Body };
