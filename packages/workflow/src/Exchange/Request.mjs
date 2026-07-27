import { I, _I } from './Symbol.mjs';
import { createReadStream } from 'node:fs';
import { open, unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { Readable } from 'node:stream';
import { ThrowAdapter, AdapterGuard } from './Utils.mjs';
import { useConfig } from './Config.mjs';
import * as Assert from './Parser.mjs';

const _tooLarge = () => {
  const e = new Error('Request body exceeds configured limit.');
  e.statusCode = 413;
  return e;
};

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
    cached: false,
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

  [I.REQUEST.BODY.OPEN_ENTRY]() {
    const progress = this[I.REQUEST.BODY.PROGRESS];
    const thisConfiguration = this[I.REQUEST.BODY.CONFIGURATION];
    const raw = GuardNotThrow.bodyData(this[I.EXCHANGE]);

    const source = Readable.toWeb(
      raw instanceof Readable
        ? raw
        : typeof raw?.on === 'function'
          ? raw
          : raw?.[Symbol.asyncIterator]
            ? Readable.from(raw)
            : (() => {
              throw new TypeError('Unsupported body source.');
            })(),
    );

    let counted = 0;

    const entry = new ReadableStream({
      async start(controller) {
        const reader = source.getReader();

        try {
          while (true) {
            const { value, done } = await reader.read();

            if (done) {
              controller.close();
              return;
            }

            counted += value.length;

            if (counted > thisConfiguration.maxBodySize) {
              controller.error(_tooLarge());
              return;
            }

            controller.enqueue(value);
          }
        } catch (err) {
          controller.error(err);
        }
      },
    });

    const [consumer, cacheBranch] = entry.tee();

    this[I.REQUEST.BODY.ENTRY] = consumer;

    const memoryLimit = thisConfiguration.maxRequestBodyBuffer;

    (async () => {
      const reader = cacheBranch.getReader();
      const buf = [];
      let drained = 0;
      let file = null;

      try {
        while (true) {
          const { value, done } = await reader.read();

          if (done) break;

          const chunk = Buffer.isBuffer(value) ? value : Buffer.from(value);
          drained += chunk.length;

          if (!file && drained > memoryLimit) {
            const name = `kitty-body-${Date.now()}-${randomBytes(4).toString('hex')}`;
            file = await open(join(tmpdir(), name), 'w');

            for (const b of buf) await file.write(b);
            buf.length = 0;
          }

          if (file) {
            await file.write(chunk);
          } else {
            buf.push(chunk);
          }
        }

        if (file) {
          await file.close();
          progress.buffer = null;
          progress.pathname = file.path;
        } else {
          progress.buffer = Buffer.concat(buf);
        }
      } catch {
        if (file) {
          await file.close().catch(() => {});
          await unlink(file.path).catch(() => {});
        }
      } finally {
        progress.cached = true;
        this[I.REQUEST.BODY.ENTRY] = null;
      }
    })().catch(() => {});

    return consumer;
  }

  get data() {
    const progress = this[I.REQUEST.BODY.PROGRESS];

    if (progress.consumed) {
      if (progress.cached) {
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

      const [consumer, remaining] = this[I.REQUEST.BODY.ENTRY].tee();

      this[I.REQUEST.BODY.ENTRY] = remaining;

      return consumer;
    }

    progress.consumed = true;

    const thisConfiguration = this[I.REQUEST.BODY.CONFIGURATION];
    const method = this[I.EXCHANGE].request.method;

    if (!thisConfiguration.allowedBodyMethods.includes(method)) {
      progress.cached = true;

      return new ReadableStream({ start: (c) => c.close() });
    }

    return this[I.REQUEST.BODY.OPEN_ENTRY]();
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
