import * as http2 from 'node:http2';
import { Readable } from 'node:stream';
import { randomBytes } from 'node:crypto';

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Kit from '@produck/kit';
import { Abstract, SYMBOL, useWebSocket } from '@produck/kitty-workflow';
import * as Http2Https from '@produck/kitty-deployer-http2-https';
import * as WebSocketExchange from '@produck/kitty-deployer-http2-https/exchange/websocket';

import credentials from './credentials.mjs';
import Distributor from './Distributor.mjs';

const Deployer = Http2Https.Deployer.Http2HttpsDeployer;
const WithWebSocket = Deployer.withWebSocketExchange(
  WebSocketExchange.Exchange,
);

const TIMEOUT = 3000;
const OPCODE = { TEXT: 0x1, CLOSE: 0x8 };

class Workflow extends Abstract.Workflow {
  [SYMBOL.WORKFLOW._I.NORMALIZE_HTTP_RESPONSE_BODY_DATA](value) {
    if (value === undefined || value === null) {
      return { stream: null, length: 0 };
    }

    const buffer = Buffer.from(String(value));

    return {
      stream: Readable.toWeb(Readable.from([buffer])),
      length: buffer.length,
    };
  }
}

async function serve(handler) {
  const workflow = new Workflow(Kit.global);

  workflow.setRequestBodyDistributorConstructor(Distributor);
  workflow.use(handler);
  workflow.finalize();

  const server = http2.createSecureServer({
    ...credentials,
    allowHTTP1: true,
  });
  const sessions = new Set();

  server.on('session', (session) => sessions.add(session));
  await workflow.withDeployer(WithWebSocket).deploy(server);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

  const { port } = server.address();

  return {
    port,
    close() {
      for (const session of sessions) {
        session.destroy();
      }

      return new Promise((resolve) => server.close(resolve));
    },
  };
}

function withTimeout(promise, what) {
  let timer = null;

  const guard = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${what} timeout`)), TIMEOUT);
  });

  return Promise.race([promise, guard]).finally(() => clearTimeout(timer));
}

function maskedFrame(opcode, payload) {
  const data = Buffer.from(payload);
  const mask = randomBytes(4);
  const body = Buffer.allocUnsafe(data.length);

  for (let index = 0; index < data.length; index += 1) {
    body[index] = data[index] ^ mask[index % 4];
  }

  return Buffer.concat([
    Buffer.from([0x80 | opcode, 0x80 | data.length]),
    mask,
    body,
  ]);
}

function createReader(stream) {
  let buffer = Buffer.alloc(0);
  const frames = [];
  const waiters = [];

  stream.on('data', (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);

    while (buffer.length >= 2) {
      const length = buffer[1] & 0x7f;

      if (buffer.length < 2 + length) {
        break;
      }

      frames.push({
        opcode: buffer[0] & 0x0f,
        payload: buffer.subarray(2, 2 + length),
      });

      buffer = buffer.subarray(2 + length);
    }

    waiters.splice(0).forEach((resolve) => resolve());
  });

  return {
    async next() {
      while (frames.length === 0) {
        await withTimeout(
          new Promise((resolve) => waiters.push(resolve)),
          'frame',
        );
      }

      return frames.shift();
    },
  };
}

async function connect(port) {
  const client = http2.connect(`https://127.0.0.1:${port}`, {
    rejectUnauthorized: false,
    settings: { enableConnectProtocol: true },
  });
  const stream = client.request({
    ':method': 'CONNECT',
    ':protocol': 'websocket',
    ':path': '/ws',
    'sec-websocket-version': '13',
  });
  const reader = createReader(stream);

  const response = await withTimeout(
    new Promise((resolve, reject) => {
      stream.once('response', resolve);
      stream.once('error', reject);
    }),
    'response',
  );

  return {
    stream,
    reader,
    status: response[':status'],
    close() {
      stream.close();
      client.close();
    },
  };
}

describe('WebSocket', () => {
  describe('::withWebSocketExchange()', () => {
    it('should tag the deployer and bind the exchange class', () => {
      assert.equal(WithWebSocket[SYMBOL.DEPLOYER._S.TAG], '2:https,websocket');
      assert.equal(
        WithWebSocket[SYMBOL.DEPLOYER._S.EXCHANGE_CTOR.WEB_SOCKET],
        WebSocketExchange.Exchange,
      );
    });
  });

  describe('.handleUpgrade', () => {
    it('should accept the extended CONNECT over TLS and echo a frame', async () => {
      const app = await serve((context) => {
        const controller = useWebSocket(context);

        controller.acceptUpgrade();
        controller.addEventListener('message', (event) => {
          controller.send(String(event.data).toUpperCase());
        });
      });

      try {
        const client = await connect(app.port);

        assert.equal(client.status, 200);

        client.stream.write(maskedFrame(OPCODE.TEXT, 'secure'));

        const frame = await client.reader.next();

        assert.equal(frame.opcode, OPCODE.TEXT);
        assert.equal(frame.payload.toString('utf8'), 'SECURE');

        client.close();
      } finally {
        await app.close();
      }
    });

    it('should close the connection from the handler', async () => {
      const app = await serve((context) => {
        const controller = useWebSocket(context);

        controller.acceptUpgrade();
        controller.addEventListener('message', () => {
          controller.close(1000, 'done');
        });
      });

      try {
        const client = await connect(app.port);

        client.stream.write(maskedFrame(OPCODE.TEXT, 'bye'));

        const frame = await client.reader.next();

        assert.equal(frame.opcode, OPCODE.CLOSE);
        assert.equal(frame.payload.readUInt16BE(0), 1000);
        assert.equal(frame.payload.subarray(2).toString('utf8'), 'done');
      } finally {
        await app.close();
      }
    });
  });

  describe('.rejectUpgrade', () => {
    it('should answer an http error instead of accepting the stream', async () => {
      const app = await serve((context) => {
        useWebSocket(context).rejectUpgrade(403, 'no way');
      });

      try {
        const client = await connect(app.port);

        assert.equal(client.status, 403);

        client.close();
      } finally {
        await app.close();
      }
    });
  });
});
