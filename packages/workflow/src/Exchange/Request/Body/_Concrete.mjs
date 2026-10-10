import { createReadStream } from 'node:fs';
import { open, unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { Readable } from 'node:stream';

import * as Part from '../../Part/index.mjs';
import { I } from './_Symbol.mjs';
import { EXCHANGE } from './_Borrow.mjs';
import { AdapterGuard } from '../../Utils.mjs';
import { useConfig } from '../../Config.mjs';

const _tooLarge = () => {
  const e = new Error('Request body exceeds configured limit.');
  e.statusCode = 413;
  return e;
};

const GuardNotThrow = {
  bodyData: AdapterGuard({
    message: 'Request body data read failed.',
    member: EXCHANGE._I.REQUEST.BODY.DATA.GET,
  }),
};

export default class KittyExchangeRequestBody extends Part.Concrete {
  [I.PROGRESS] = {
    consumed: false,
    cached: false,
    buffer: Buffer.alloc(0),
    pathname: null,
  };

  [I.CONFIGURATION] = {
    maxBodySize: 0,
    maxRequestBodyBuffer: 0,
    allowedBodyMethods: [],
  };

  constructor(exchange) {
    super(exchange);

    const config = useConfig(this.exchange[EXCHANGE.$I.KIT]);
    const thisConfiguration = this[I.CONFIGURATION];

    thisConfiguration.maxBodySize = config.maxBodySize;
    thisConfiguration.maxRequestBodyBuffer = config.maxRequestBodyBuffer;
    thisConfiguration.allowedBodyMethods = config.allowedBodyMethods;
  }

  get isConsumed() {
    return this[I.PROGRESS].consumed;
  }

  [I.OPEN_ENTRY]() {
    const progress = this[I.PROGRESS];
    const thisConfiguration = this[I.CONFIGURATION];
    const raw = GuardNotThrow.bodyData(this.exchange);

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

    this[I.ENTRY] = consumer;

    const memoryLimit = thisConfiguration.maxRequestBodyBuffer;

    (async () => {
      const reader = cacheBranch.getReader();
      const buf = [];
      let drained = 0;
      let file = null;

      try {
        while (true) {
          const { value, done } = await reader.read();

          if (done) {
            break;
          }

          const chunk = Buffer.isBuffer(value) ? value : Buffer.from(value);
          drained += chunk.length;

          if (!file && drained > memoryLimit) {
            const name = `kitty-body-${Date.now()}-${randomBytes(4).toString('hex')}`;
            file = await open(join(tmpdir(), name), 'w');

            for (const b of buf) {
              await file.write(b);
            }
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
        this[I.ENTRY] = null;
      }
    })().catch(() => {});

    return consumer;
  }

  get data() {
    const progress = this[I.PROGRESS];

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

      const [consumer, remaining] = this[I.ENTRY].tee();

      this[I.ENTRY] = remaining;

      return consumer;
    }

    progress.consumed = true;

    const thisConfiguration = this[I.CONFIGURATION];
    const method = this.exchange.request.method;

    if (!thisConfiguration.allowedBodyMethods.includes(method)) {
      progress.cached = true;

      return new ReadableStream({ start: (c) => c.close() });
    }

    return this[I.OPEN_ENTRY]();
  }
}
