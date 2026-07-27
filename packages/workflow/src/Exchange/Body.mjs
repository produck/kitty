import { open, unlink } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { Readable } from 'node:stream';

function _empty() {
  return new ReadableStream({
    start(c) {
      c.close();
    },
  });
}

function _chunk(data) {
  return new ReadableStream({
    start(c) {
      c.enqueue(new Uint8Array(data));
      c.close();
    },
  });
}

function _tooLarge() {
  const e = new Error('Request body exceeds configured limit.');
  e.statusCode = 413;
  return e;
}

function _toNodeReadable(source) {
  if (source instanceof Readable) return source;
  if (typeof source?.on === 'function') return source;
  if (source?.[Symbol.asyncIterator]) return Readable.from(source);
  throw new TypeError('Unsupported body source.');
}

export function createBodyStream(raw, opts) {
  const { maxBodySize, memoryLimit, allowedMethods, method } = opts;

  if (!allowedMethods.includes(method)) return _empty();
  if (raw === null || raw === undefined) return _empty();

  if (Buffer.isBuffer(raw)) {
    if (raw.length > maxBodySize) throw _tooLarge();
    return _chunk(raw);
  }
  if (typeof raw === 'string') return createBodyStream(Buffer.from(raw), opts);

  return _limited(_toNodeReadable(raw), maxBodySize, memoryLimit);
}

function _limited(source, maxBodySize, memoryLimit) {
  let cancelled = false;
  let file = null;

  return new ReadableStream({
    async start(controller) {
      try {
        const buf = [];
        let total = 0;
        let spilled = false;

        for await (const value of source) {
          if (cancelled) break;

          const chunk = Buffer.isBuffer(value) ? value : Buffer.from(value);
          total += chunk.length;

          if (total > maxBodySize) {
            controller.error(_tooLarge());
            return;
          }

          if (!spilled && total > memoryLimit) {
            const name = `kitty-body-${Date.now()}-${randomBytes(4).toString('hex')}`;
            file = await open(join(tmpdir(), name), 'w');

            for (const b of buf) await file.write(b);
            buf.length = 0;
            spilled = true;
          }

          if (spilled) {
            await file.write(chunk);
          } else {
            buf.push(chunk);
          }
        }

        if (spilled && file) {
          await file.close();

          const nodeStream = createReadStream(file.path);
          const webStream = Readable.toWeb(nodeStream);
          const reader = webStream.getReader();

          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }

          try {
            await unlink(file.path);
          } catch {
            /* best effort */
          }
        } else {
          for (const chunk of buf) {
            controller.enqueue(new Uint8Array(chunk));
          }
        }

        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },

    cancel() {
      cancelled = true;
      source.destroy?.();
      if (file) {
        file.close().catch(() => {});
        try {
          unlink(file.path);
        } catch {
          /* best effort */
        }
      }
    },
  });
}
