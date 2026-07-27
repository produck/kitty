import { I, _I } from './Symbol.mjs';
import { ThrowAdapter, AdapterGuard } from './Utils.mjs';
import { useConfig } from './Config.mjs';
import { createBodyStream, drainAndCache } from './Body.mjs';
import * as Assert from './Parser.mjs';

const GuardNotThrow = {
  header: AdapterGuard({
    message: 'Header read failed.',
    member: _I.REQUEST.HEADER.GET,
  }),
  headerKeys: AdapterGuard({
    message: 'Header keys iteration failed.',
    member: _I.REQUEST.HEADER.KEYS,
  }),
  bodyData: AdapterGuard({
    message: 'Request body data read failed.',
    member: _I.REQUEST.BODY.DATA.GET,
  }),
  method: AdapterGuard({
    message: 'Request method read failed.',
    member: _I.REQUEST.METHOD.GET,
  }),
  mode: AdapterGuard({
    message: 'Request mode read failed.',
    member: _I.REQUEST.MODE.GET,
  }),
  url: AdapterGuard({
    message: 'Request URL read failed.',
    member: _I.REQUEST.URL.GET,
  }),
};

class KittyExchangeRequestHeader {
  constructor(exchange) {
    this[I.EXCHANGE] = exchange;
  }

  get(key) {
    Assert.HeaderName(key);

    return GuardNotThrow.header(this[I.EXCHANGE], key);
  }

  has(key) {
    return this.get(key) !== undefined;
  }

  keys() {
    return GuardNotThrow.headerKeys(this[I.EXCHANGE]);
  }

  *entries() {
    for (const key of this.keys()) {
      yield [key, this.get(key)];
    }
  }
}

class KittyExchangeRequestBody {
  [I.REQUEST.BODY.CONSUMED] = false;

  constructor(exchange) {
    this[I.EXCHANGE] = exchange;
  }

  get isConsumed() {
    return this[I.REQUEST.BODY.CONSUMED];
  }

  get data() {
    if (this.isConsumed) {
      return this[I.REQUEST.BODY.PATHNAME] !== undefined
        ? createBodyStream({
          kind: 'file',
          path: this[I.REQUEST.BODY.PATHNAME],
        })
        : createBodyStream({
          kind: 'buffer',
          data: this[I.REQUEST.BODY.BUFFER],
        });
    }

    this[I.REQUEST.BODY.CONSUMED] = true;

    const exchange = this[I.EXCHANGE];
    const kit = exchange[I.KIT];
    const config = useConfig(kit);
    const method = exchange[_I.REQUEST.METHOD.GET]();

    if (!config.allowedBodyMethods.includes(method)) {
      this[I.REQUEST.BODY.BUFFER] = Buffer.alloc(0);
      return createBodyStream({
        kind: 'buffer',
        data: this[I.REQUEST.BODY.BUFFER],
      });
    }

    const raw = GuardNotThrow.bodyData(exchange);

    if (Buffer.isBuffer(raw)) {
      this[I.REQUEST.BODY.BUFFER] = raw;
      return createBodyStream({ kind: 'buffer', data: raw });
    }

    if (typeof raw === 'string') {
      this[I.REQUEST.BODY.BUFFER] = Buffer.from(raw);
      return createBodyStream({
        kind: 'buffer',
        data: this[I.REQUEST.BODY.BUFFER],
      });
    }

    if (raw === null || raw === undefined) {
      this[I.REQUEST.BODY.BUFFER] = Buffer.alloc(0);
      return createBodyStream({
        kind: 'buffer',
        data: this[I.REQUEST.BODY.BUFFER],
      });
    }

    return drainAndCache(
      raw,
      {
        maxBodySize: config.maxBodySize,
        memoryLimit: config.maxRequestBodyBuffer,
      },
      (source) => {
        if (source.kind === 'buffer') this[I.REQUEST.BODY.BUFFER] = source.data;
        else if (source.kind === 'file')
          this[I.REQUEST.BODY.PATHNAME] = source.path;
      },
    );
  }
}

export default class KittyExchangeRequest {
  constructor(exchange) {
    this[I.EXCHANGE] = exchange;
    this.header = new KittyExchangeRequestHeader(exchange);
    this.body = new KittyExchangeRequestBody(exchange);
    Object.freeze(this);
  }

  get method() {
    return GuardNotThrow.method(this[I.EXCHANGE]);
  }

  get mode() {
    return GuardNotThrow.mode(this[I.EXCHANGE]);
  }

  get url() {
    const raw = GuardNotThrow.url(this[I.EXCHANGE]);

    try {
      return new URL(raw);
    } catch {
      const host = this.header.get('host');

      if (host === undefined) {
        ThrowAdapter('Host header is required to construct request URL.');
      }

      return new URL(raw, `${this[I.EXCHANGE].protocol}//${host}`);
    }
  }

  get isConsumed() {
    return this.body.isConsumed;
  }
}
