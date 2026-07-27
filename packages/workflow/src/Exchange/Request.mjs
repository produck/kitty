import { I, _I } from './Symbol.mjs';
import { createReadStream } from 'node:fs';
import { Readable } from 'node:stream';
import { ThrowAdapter, AdapterGuard } from './Utils.mjs';
import { useConfig } from './Config.mjs';
import { drainAndCache } from './Body.mjs';
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
  [I.REQUEST.BODY.PROGRESS] = {
    consumed: false,
    buffer: Buffer.alloc(0),
    pathname: null,
  };

  [I.REQUEST.BODY.CONFIGURATION] = {
    maxBodySize: 0,
    maxRequestBodyBuffer: 0,
    allowedBodyMethods: [],
  };

  constructor(exchange) {
    this[I.EXCHANGE] = exchange;

    const config = useConfig(exchange[I.KIT]);
    const thisConfiguration = this[I.REQUEST.BODY.CONFIGURATION];

    thisConfiguration.maxBodySize = config.maxBodySize;
    thisConfiguration.maxRequestBodyBuffer = config.maxRequestBodyBuffer;
    thisConfiguration.allowedBodyMethods = config.allowedBodyMethods;
  }

  get isConsumed() {
    return this[I.REQUEST.BODY.PROGRESS].consumed;
  }

  get data() {
    const progress = this[I.REQUEST.BODY.PROGRESS];

    if (progress.consumed) {
      if (progress.pathname !== null) {
        return Readable.toWeb(createReadStream(progress.pathname));
      }

      return new ReadableStream({
        start: (c) => {
          c.enqueue(new Uint8Array(progress.buffer));
          c.close();
        },
      });
    }

    progress.consumed = true;

    const thisConfiguration = this[I.REQUEST.BODY.CONFIGURATION];
    const method = this[I.EXCHANGE].request.method;

    if (!thisConfiguration.allowedBodyMethods.includes(method)) {
      return new ReadableStream({ start: (c) => c.close() });
    }

    const exchange = this[I.EXCHANGE];
    const raw = GuardNotThrow.bodyData(exchange);

    return drainAndCache(
      raw,
      {
        maxBodySize: thisConfiguration.maxBodySize,
        memoryLimit: thisConfiguration.maxRequestBodyBuffer,
      },
      (source) => {
        if (source.kind === 'buffer') progress.buffer = source.data;
        else if (source.kind === 'file') progress.pathname = source.path;
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
