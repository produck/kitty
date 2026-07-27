import { open, unlink } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { Readable } from 'node:stream';

function _toNodeReadable(source) {
  if (source instanceof Readable) return source;
  if (typeof source?.on === 'function') return source;
  if (source?.[Symbol.asyncIterator]) return Readable.from(source);
  throw new TypeError('Unsupported body source.');
}

function _tooLarge() {
  const e = new Error('Request body exceeds configured limit.');
  e.statusCode = 413;
  return e;
}

/** Create a fresh independent WHATWG ReadableStream from a cached source. */
export function createBodyStream(source) {
  if (source.kind === 'empty') {
    return new ReadableStream({
      start(c) {
        c.close();
      },
    });
  }

  if (source.kind === 'buffer') {
    const data = source.data;
    return new ReadableStream({
      start(c) {
        c.enqueue(new Uint8Array(data));
        c.close();
      },
    });
  }

  if (source.kind === 'file') {
    const nodeStream = createReadStream(source.path);
    return Readable.toWeb(nodeStream);
  }

  throw new TypeError('Unknown body source kind.');
}

/**
 * Drain and cache a raw stream, synchronously returning a ReadableStream.
 * `onCached` is called once the source is fully drained with the cache object.
 */
export function drainAndCache(raw, { maxBodySize, memoryLimit }, onCached) {
  const source = _toNodeReadable(raw);
  const buf = [];
  let total = 0;
  let file = null;
  let done = false;

  async function _finalize() {
    if (done) return;
    done = true;

    if (file) {
      await file.close();
      onCached({ kind: 'file', path: file.path });
    } else {
      onCached({ kind: 'buffer', data: Buffer.concat(buf) });
    }
  }

  return new ReadableStream({
    type: 'bytes',

    async start(controller) {
      try {
        for await (const value of source) {
          const chunk = Buffer.isBuffer(value) ? value : Buffer.from(value);
          total += chunk.length;

          if (total > maxBodySize) {
            controller.error(_tooLarge());
            return;
          }

          if (!file && total > memoryLimit) {
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

          controller.enqueue(new Uint8Array(chunk));
        }

        await _finalize();
        controller.close();
      } catch (err) {
        if (file) {
          await file.close().catch(() => {});
          await unlink(file.path).catch(() => {});
        }
        controller.error(err);
      }
    },

    cancel() {
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
