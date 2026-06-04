import Abstract, { Member as M } from '@produck/es-abstract';
import { _I } from './Symbol.mjs';

class ResponseHeader {
  #response;

  constructor(response) {
    this.#response = response;
  }

  get(key) {
    return this.#response[_I.HEADER.GET](key);
  }

  has(key) {
    return this.#response[_I.HEADER.HAS](key);
  }

  keys() {
    return this.#response[_I.HEADER.KEYS]();
  }

  entries() {
    return this.#response[_I.HEADER.ENTRIES]();
  }

  set(key, value) {
    this.#response[_I.HEADER.SET](key, value);
  }

  delete(key) {
    this.#response[_I.HEADER.DELETE](key);
  }

  clear() {
    this.#response[_I.HEADER.CLEAR]();
  }
}

class ResponseBody {
  #response;

  constructor(response) {
    this.#response = response;
  }

  get data() {
    return this.#response[_I.BODY.DATA.GET]();
  }

  set data(value) {
    this.#response[_I.BODY.DATA.SET](value);
  }
}

export default Abstract(
  class Response {
    constructor() {
      this.header = new ResponseHeader(this);
      this.body = new ResponseBody(this);
      Object.freeze(this);
    }
  },
  ...[
    Abstract({
      [_I.HEADER.GET]: M.Method().args(M.String).returns(M.Any),
      [_I.HEADER.HAS]: M.Method().args(M.String).returns(M.Boolean),
      [_I.HEADER.KEYS]: M.Method().returns(M.Any),
      [_I.HEADER.ENTRIES]: M.Method().returns(M.Any),
      [_I.HEADER.SET]: M.Method().args(M.String, M.Any),
      [_I.HEADER.DELETE]: M.Method().args(M.String),
      [_I.HEADER.CLEAR]: M.Method(),
      [_I.BODY.DATA.GET]: M.Method().returns(M.Any),
      [_I.BODY.DATA.SET]: M.Method().args(M.Any),
    }),
  ],
);

export { ResponseHeader as Header, ResponseBody as Body };
