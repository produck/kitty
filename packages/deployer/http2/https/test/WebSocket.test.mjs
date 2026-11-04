import * as http2 from 'node:http2';
import { request as request1 } from 'node:https';
import { Readable } from 'node:stream';
import { randomBytes } from 'node:crypto';

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { WebSocket } from 'ws';

import * as Kit from '@produck/kit';
import {
  Abstract,
  SYMBOL,
  useExchange,
  useWebSocket,
} from '@produck/kitty-workflow';
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

function connectH1(port) {
  const socket = new WebSocket(`wss://127.0.0.1:${port}/ws`, {
    rejectUnauthorized: false,
  });
  const inbox = [];
  const closings = [];
  const waiters = [];

  const notify = () => waiters.splice(0).forEach((resolve) => resolve());

  socket.on('message', (data, isBinary) => {
    inbox.push({ data, isBinary });
    notify();
  });

  socket.on('close', (code, reason) => {
    closings.push({ code, reason });
    notify();
  });

  async function take(queue) {
    while (queue.length === 0) {
      await withTimeout(
        new Promise((resolve) => waiters.push(resolve)),
        'event',
      );
    }

    return queue.shift();
  }

  return {
    ready: withTimeout(
      new Promise((resolve, reject) => {
        socket.once('open', resolve);
        socket.once('error', reject);
      }),
      'handshake',
    ),
    send: (data) => socket.send(data),
    terminate: () => socket.terminate(),
    nextMessage: () => take(inbox).then(({ data }) => data),
    nextClose: () => take(closings),
  };
}

function upgradeH1(port) {
  return withTimeout(
    new Promise((resolve, reject) => {
      const request = request1({
        host: '127.0.0.1',
        port,
        path: '/ws',
        rejectUnauthorized: false,
        headers: {
          Connection: 'Upgrade',
          Upgrade: 'websocket',
          'Sec-WebSocket-Version': '13',
          'Sec-WebSocket-Key': randomBytes(16).toString('base64'),
        },
      });

      request.on('response', (response) => {
        response.resume();
        resolve(response.statusCode);
      });
      request.on('upgrade', (response, socket) => {
        socket.destroy();
        resolve(response.statusCode);
      });
      request.on('error', reject);
      request.end();
    }),
    'upgrade',
  );
}

describe('WebSocket', () => {
  describe('::withWebSocketExchange()', () => {
    it('should tag the deployer and bind the exchange class', () => {
      const base = Deployer[SYMBOL.DEPLOYER._S.TAG];

      assert.equal(WithWebSocket[SYMBOL.DEPLOYER._S.TAG], `${base},websocket`);
      assert.equal(
        WithWebSocket[SYMBOL.DEPLOYER._S.EXCHANGE_CTOR.WEB_SOCKET],
        WebSocketExchange.Exchange,
      );
    });

    it('should refuse a second websocket derivation', () => {
      assert.throws(
        () => WithWebSocket.withWebSocketExchange(WebSocketExchange.Exchange),
        /MUST NOT carry another WebSocket/,
      );
    });
  });

  describe('.handleUpgrade', () => {
    it('should answer the protocol and the version', async () => {
      const app = await serve((context) => {
        const controller = useWebSocket(context);
        const exchange = useExchange(context);

        controller.acceptUpgrade();
        controller.send(`${exchange.protocol} ${exchange.httpVersion}`);
      });

      try {
        const client = await connect(app.port);
        const frame = await client.reader.next();

        assert.equal(frame.payload.toString('utf8'), 'https: 2.0');

        client.close();
      } finally {
        await app.close();
      }
    });
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

  describe('>http/1.1 client', () => {
    it('should answer the protocol and the version', async () => {
      const app = await serve((context) => {
        const controller = useWebSocket(context);
        const exchange = useExchange(context);

        controller.acceptUpgrade();
        controller.send(`${exchange.protocol} ${exchange.httpVersion}`);
      });

      try {
        const client = await connectH1(app.port);

        await client.ready;

        const received = await client.nextMessage();

        assert.equal(String(received), 'https: 1.1');

        client.terminate();
      } finally {
        await app.close();
      }
    });
    it('should accept the upgrade and echo a frame', async () => {
      const app = await serve((context) => {
        const controller = useWebSocket(context);

        controller.acceptUpgrade();
        controller.addEventListener('message', (event) => {
          controller.send(String(event.data).toUpperCase());
        });
      });

      try {
        const client = await connectH1(app.port);

        await client.ready;
        client.send('plain');

        const received = await client.nextMessage();

        assert.equal(String(received), 'PLAIN');

        client.terminate();
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
        const client = await connectH1(app.port);

        await client.ready;
        client.send('bye');

        const close = await client.nextClose();

        assert.equal(close.code, 1000);
        assert.equal(String(close.reason), 'done');
      } finally {
        await app.close();
      }
    });

    it('should reject the upgrade with the http error', async () => {
      const app = await serve((context) => {
        useWebSocket(context).rejectUpgrade(403, 'no way');
      });

      try {
        const status = await upgradeH1(app.port);

        assert.equal(status, 403);
      } finally {
        await app.close();
      }
    });
  });
});
