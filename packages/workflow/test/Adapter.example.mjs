// Read-only example: a `node:http` adapter against the current design.
//
// Nothing here runs — `test/index.mjs` does not import it. It exists so the
// adapter-facing contract is visible in one place: which hooks the framework
// calls, in what order, and what every `_I` / `_S` member has to answer.
//
// Framework call order:
//
//   1. Registry.registerAdapter(adapter)        keyed by the server class
//   2. adapter.install(AdapterKit)             compile time, one shot, declares
//   3. host attaches <listeners>; link() runs  deploy time
//   4. listener(...)                           runtime, once per exchange
//   5.   the adapter builds `internal` — its record of this exchange's native
//        objects — and awaits handleExchange(internal)
//   6. handleExchange: derive the ExchangeKit → construct adapter.Exchange →
//        dedup on `$I.IDENTITY` → install the Exchange on the kit → attachers
//        → handler pipeline → finally dispatch `close`
//   7. the adapter writes the response back onto the socket
//
// Every `_I` member is called with `internal` as its first argument — parts and
// the Exchange alike — so an implementation reads the record from there
// instead of keeping a slot of its own.
//
// The adapter hands the framework a class, not a factory. `Registry` requires
// every record to carry `Exchange`, and `handleExchange` is the only place an
// Exchange is constructed. That is also how `internal` reaches the adapter: as
// the Exchange's second constructor argument.
//
// AdapterKit also offers `attachDeployment(name, value)` and
// `appendExchangeAttacher(fn)`; this example needs neither.
//
// Spots marked [pending n] depend on a decision that is still open.

import * as http from 'node:http';
import { Readable } from 'node:stream';

import * as Fugue from '@produck/fugue';
import * as NodeFile from '@produck/fugue-degraded-node-file';

import * as Exchange from '../src/Exchange/index.mjs';
import { _I as X_I, _S as X_S } from '../src/Exchange/_Symbol.mjs';
import * as Request from '../src/Exchange/Request/index.mjs';
import { _I as R_I, _S as R_S } from '../src/Exchange/Request/_Symbol.mjs';
import * as RequestHeader from '../src/Exchange/Request/Header/index.mjs';
import { _I as RH_I } from '../src/Exchange/Request/Header/_Symbol.mjs';
import * as RequestBody from '../src/Exchange/Request/Body/index.mjs';
import {
  _I as RB_I,
  _S as RB_S,
} from '../src/Exchange/Request/Body/_Symbol.mjs';
import * as Response from '../src/Exchange/Response/index.mjs';
import { _I as S_I, _S as S_S } from '../src/Exchange/Response/_Symbol.mjs';
import * as ResponseHeader from '../src/Exchange/Response/Header/index.mjs';
import { _I as SH_I } from '../src/Exchange/Response/Header/_Symbol.mjs';
import * as ResponseBody from '../src/Exchange/Response/Body/index.mjs';
import { _I as SB_I } from '../src/Exchange/Response/Body/_Symbol.mjs';
import { useServer } from '../src/Workflow/Capability.mjs';

//
// -------------------------------------------------------------- the adapter
//

function install(AdapterKit) {
  // Compile time, one shot: every write hook below stops working once the
  // artifact is compiled, so all declaring happens inside this call.
  const server = useServer(AdapterKit);

  AdapterKit.setServerLinker(() => server.listen(8080, '127.0.0.1'));

  // The adapter does not attach its own listeners; it hands over a
  // `name → fn` record and the host attaches them to the server.
  AdapterKit.exportListener('request', (req, res) =>
    handleRequest(AdapterKit, server, req, res),
  );
}

async function handleRequest(AdapterKit, server, req, res) {
  // The framework stores this object and never reads it; the adapter is the
  // only one that knows its shape. It comes back as the Exchange's second
  // constructor argument, and every part reaches it through the Exchange.
  const internal = { server, request: req, response: res };

  try {
    await AdapterKit.handleExchange(internal);
  } catch (cause) {
    if (!res.headersSent) {
      res.writeHead(500, { 'content-type': 'text/plain' });
    }

    res.end(String(cause?.message ?? cause));
  }
}

async function respond(exchange, res) {
  if (res.writableEnded) {
    return;
  }

  res.statusCode = exchange.statusCode;

  if (exchange.statusText !== '') {
    res.statusMessage = exchange.statusText;
  }

  const body = exchange.response.body.data;

  if (body === undefined || body === null) {
    return void res.end();
  }

  if (typeof body === 'string' || Buffer.isBuffer(body)) {
    return void res.end(body);
  }

  if (body instanceof Readable) {
    return void body.pipe(res);
  }

  if (body instanceof ReadableStream) {
    return void Readable.fromWeb(body).pipe(res);
  }

  throw new TypeError('Unsupported response body.');
}

class HttpServer extends http.Server {}

//
// ------------------------------------------------------------- the Exchange
//

class Http1Exchange extends Exchange.Abstract {
  constructor(ExchangeKit, internal) {
    super(ExchangeKit, internal);

    // `close` arrives from `handleExchange`'s `finally`, after the handler
    // pipeline has run. [pending 16] — the write-back route is not settled:
    // the alternative is `handleExchange` answering the Exchange, so that the
    // listener can respond with it instead.
    this.addEventListener('close', () => {
      respond(this, internal.response).catch((cause) => {
        internal.response.destroy(cause);
      });
    });
  }

  static get [X_S.REQUEST_CTOR]() {
    return Http1Request;
  }

  static get [X_S.RESPONSE_CTOR]() {
    return Http1Response;
  }

  // The adapter answers the identity; the framework only dedups on it. `req` is
  // the documented h1 default — the socket would be wrong, because one
  // connection serves many exchanges.
  [X_I.IDENTITY.GET](internal) {
    return internal.request;
  }

  [X_I.SERVER.GET](internal) {
    return internal.server;
  }

  [X_I.SERVER.PROTOCOL.GET]() {
    return 'http:';
  }

  [X_I.HTTP_VERSION.GET](internal) {
    return internal.request.httpVersion;
  }
}

//
// -------------------------------------------------------------- the Request
//

class Http1Request extends Request.Abstract {
  static get [R_S.HEADER_CTOR]() {
    return Http1RequestHeader;
  }

  static get [R_S.BODY_CTOR]() {
    return Http1RequestBody;
  }

  [R_I.MODE.GET]() {
    return 'http';
  }

  [R_I.METHOD.GET](internal) {
    return internal.request.method;
  }

  // Origin-form only, e.g. `/a?b=1`. The base turns it into an absolute URL
  // with the `Host` header and `exchange.protocol` — which is why that fallback
  // exists in the first place.
  [R_I.URL.GET](internal) {
    return internal.request.url;
  }
}

class Http1RequestHeader extends RequestHeader.Abstract {
  // Node lowercases incoming header names.
  [RH_I.GET](internal, key) {
    return internal.request.headers[key];
  }

  [RH_I.KEYS](internal) {
    return Object.keys(internal.request.headers);
  }
}

class Http1RequestBody extends RequestBody.Abstract {
  static get [RB_S.DISTRIBUTOR_CTOR]() {
    return Http1Distributor;
  }

  // Must be a byte stream: `Readable.from([...])` defaults to objectMode and
  // breaks the degrade probe. `IncomingMessage` is a byte stream.
  [RB_I.SOURCE.GET](internal) {
    return internal.request;
  }
}

// The medium is a package, not something the Body assembles: the reader family
// arrives whole, and it already points at its own transferrer.
class Http1Distributor extends Fugue.Distributor {
  static get [Fugue.SYMBOL.DISTRIBUTOR._S.DEGRADED_CHUNK_READER_CTOR]() {
    return NodeFile.ChunkReader;
  }
}

//
// ------------------------------------------------------------- the Response
//

class Http1Response extends Response.Abstract {
  static get [S_S.HEADER_CTOR]() {
    return Http1ResponseHeader;
  }

  static get [S_S.BODY_CTOR]() {
    return Http1ResponseBody;
  }

  // Status and finished-ness map straight onto Node's own response object, so
  // the adapter keeps no state of its own for them.
  [S_I.STATUS.GET](internal) {
    return internal.response.statusCode;
  }

  [S_I.STATUS.SET](internal, code) {
    internal.response.statusCode = code;
  }

  [S_I.STATUS_TEXT.GET](internal) {
    return internal.response.statusMessage ?? '';
  }

  [S_I.STATUS_TEXT.SET](internal, text) {
    internal.response.statusMessage = text;
  }

  [S_I.IS_FINISHED](internal) {
    return internal.response.writableEnded;
  }
}

class Http1ResponseHeader extends ResponseHeader.Abstract {
  [SH_I.GET](internal, key) {
    return internal.response.getHeader(key);
  }

  [SH_I.KEYS](internal) {
    return internal.response.getHeaderNames();
  }

  [SH_I.SET](internal, key, value) {
    internal.response.setHeader(key, value);
  }

  [SH_I.DELETE](internal, key) {
    internal.response.removeHeader(key);
  }
}

class Http1ResponseBody extends ResponseBody.Abstract {
  [SB_I.DATA.GET](internal) {
    return internal.body;
  }

  [SB_I.DATA.SET](internal, value) {
    internal.body = value;
  }
}

//
// --------------------------------------------------------------- the record
//

// What the host registers. `constructor` must be a `net.Server` subclass — it
// is the lookup key, and `getByServer` matches it with `instanceof` — and
// `Exchange` must be a subclass of `Exchange.Abstract`. The classes above are
// declared before this record because a class binding has to be initialised
// before anything reads it.
export default {
  Exchange: Http1Exchange,
  constructor: HttpServer,
  install,
  name: 'http1',
};

//
// ------------------------------------------------- observations on the design
//
// 1. `Object.freeze(this)` is not uniform across the part bases. The Exchange
//    base does not freeze, so a concrete Exchange may hold a field of its own.
//    Request and Response still freeze at the end of `super()`, so a subclass
//    field initializer there throws "Cannot define property field, object is
//    not extensible" — which is why those concretes read the delivered
//    `internal` instead of keeping state in fields. Header and Body never
//    froze.
//
// 2. `_I.GET` is declared `.returns(M.String)` on both header subjects, yet
//    `has()` and `Request.get url()` treat `undefined` as "missing". It cannot
//    answer `undefined`: the contract rejects it with
//    `Invalid "member", one "string" expected.` A `string | undefined` parser
//    has to be written by hand, because `returns()` takes exactly one parser, a
//    method member is single-use, and the Member vocabulary has no union or
//    optional combinator.
//
// 3. `res.getHeader()` may answer a number or an array, which the same
//    `.returns(M.String)` contract also forbids.
//
// 4. `FileTransferrer` needs `setTransferrerArgs(absolutePath)`, but the Body
//    keeps its distributor in a private slot with no getter, so nothing can
//    reach it. `@produck/fugue-degraded-temporary-file` is the drop-in
//    alternative: it names its own file and needs no arguments.
//
// 5. Construction and installation are the framework's job, not the adapter's:
//    `handleExchange(internal)` derives the ExchangeKit, constructs
//    `adapter.Exchange(ExchangeKit, internal)`, dedups on `$I.IDENTITY`,
//    runs the attachers and the handler pipeline, and
//    dispatches `close` from a `finally`. The adapter supplies one record
//    (`internal`) and one class (the `Exchange` entry of its registry record).
//    What is still open is where the response is written back from, now that
//    the listener no longer holds the Exchange it asked for — see the
//    [pending 16] marker above.
//
// 6. `Registry.normalizeOptions` validates `constructor` with
//    `isSubConstructor(x, net.Server)`, which is strict: `net.Server` is not a
//    sub-constructor of itself. The `constructor: net.Server` default is
//    therefore unreachable, and an adapter must always name a subclass —
//    `class HttpServer extends http.Server {}` above is not optional.
