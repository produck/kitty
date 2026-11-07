import * as http2 from 'node:http2';
import { Readable } from 'node:stream';
import { randomBytes } from 'node:crypto';

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import Distributor from './Distributor.mjs';
import * as Kit from '@produck/kit';
import { Abstract, SYMBOL, Use } from '@produck/kitty-workflow';
import * as Http2Http from '@produck/kitty-deployer-http2-http';
import * as WebSocketExchange from '@produck/kitty-deployer-http2-http/exchange/websocket';

const Deployer = Http2Http.Deployer.Http2HttpDeployer;
const WithWebSocket = Deployer.withWebSocketExchange(
  WebSocketExchange.Exchange,
);

const TIMEOUT = 3000;
const OPCODE = { TEXT: 0x1, BINARY: 0x2, CLOSE: 0x8 };

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

function createWorkflow(handler) {
  const workflow = new Workflow(Kit.global);

  workflow.setRequestBodyDistributorConstructor(Distributor);
  workflow.use(handler);

  return workflow.finalize();
}

async function serve(handler) {
  const workflow = createWorkflow(handler);
  const server = http2.createServer();
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

  let header;

  if (data.length < 126) {
    header = Buffer.from([0x80 | opcode, 0x80 | data.length]);
  } else if (data.length < 65536) {
    header = Buffer.alloc(4);
    header[0] = 0x80 | opcode;
    header[1] = 0x80 | 126;
    header.writeUInt16BE(data.length, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x80 | opcode;
    header[1] = 0x80 | 127;
    header.writeBigUInt64BE(BigInt(data.length), 2);
  }

  return Buffer.concat([header, mask, body]);
}

function createReader(stream) {
  let buffer = Buffer.alloc(0);
  const frames = [];
  const waiters = [];

  const wake = () => waiters.splice(0).forEach((resolve) => resolve());

  function take() {
    if (buffer.length < 2) {
      return null;
    }

    let length = buffer[1] & 0x7f;
    let offset = 2;

    if (length === 126) {
      if (buffer.length < 4) {
        return null;
      }

      length = buffer.readUInt16BE(2);
      offset = 4;
    } else if (length === 127) {
      if (buffer.length < 10) {
        return null;
      }

      length = Number(buffer.readBigUInt64BE(2));
      offset = 10;
    }

    if (buffer.length < offset + length) {
      return null;
    }

    const frame = {
      opcode: buffer[0] & 0x0f,
      payload: buffer.subarray(offset, offset + length),
    };

    buffer = buffer.subarray(offset + length);

    return frame;
  }

  stream.on('data', (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);

    for (let frame = take(); frame !== null; frame = take()) {
      frames.push(frame);
    }

    wake();
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

async function connect(port, headers = {}) {
  const client = http2.connect(`http://127.0.0.1:${port}`, {
    settings: { enableConnectProtocol: true },
  });
  const stream = client.request({
    ':method': 'CONNECT',
    ':protocol': 'websocket',
    ':path': '/ws',
    'sec-websocket-version': '13',
    ...headers,
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
    client,
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
      const base = Deployer[SYMBOL.DEPLOYER._S.TAG];

      assert.equal(WithWebSocket[SYMBOL.DEPLOYER._S.TAG], `${base},websocket`);
      assert.equal(
        WithWebSocket[SYMBOL.DEPLOYER._S.EXCHANGE_CTOR.WEB_SOCKET],
        WebSocketExchange.Exchange,
      );
      assert.equal(
        WithWebSocket[SYMBOL.DEPLOYER._S.EXCHANGE_CTOR.HTTP],
        Deployer[SYMBOL.DEPLOYER._S.EXCHANGE_CTOR.HTTP],
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
    it('should accept the extended CONNECT and echo a text frame', async () => {
      const app = await serve((context) => {
        const controller = Use.WebSocket(context);

        controller.acceptUpgrade();
        controller.addEventListener('message', (event) => {
          assert.equal(typeof event.data, 'string');
          controller.send(event.data.toUpperCase());
        });
      });

      try {
        const client = await connect(app.port);

        assert.equal(client.status, 200);

        client.stream.write(maskedFrame(OPCODE.TEXT, 'hello'));

        const frame = await client.reader.next();

        assert.equal(frame.opcode, OPCODE.TEXT);
        assert.equal(frame.payload.toString('utf8'), 'HELLO');

        client.close();
      } finally {
        await app.close();
      }
    });

    it('should echo a binary frame as a buffer', async () => {
      const app = await serve((context) => {
        const controller = Use.WebSocket(context);

        controller.acceptUpgrade();
        controller.addEventListener('message', (event) => {
          assert.equal(event.isBinary, true);
          controller.send(event.data);
        });
      });

      try {
        const client = await connect(app.port);

        client.stream.write(maskedFrame(OPCODE.BINARY, 'binary'));

        const frame = await client.reader.next();

        assert.equal(frame.opcode, OPCODE.BINARY);
        assert.equal(frame.payload.toString('utf8'), 'binary');

        client.close();
      } finally {
        await app.close();
      }
    });

    it('should answer the ready state of the connection', async () => {
      const app = await serve((context) => {
        const controller = Use.WebSocket(context);

        controller.acceptUpgrade();
        controller.send(String(controller.readyState));
      });

      try {
        const client = await connect(app.port);
        const frame = await client.reader.next();

        assert.equal(frame.payload.toString('utf8'), '1');

        client.close();
      } finally {
        await app.close();
      }
    });

    it('should close the connection from the handler', async () => {
      const app = await serve((context) => {
        const controller = Use.WebSocket(context);

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

    it('should settle the closed promise when the client leaves', async () => {
      const closed = [];

      const app = await serve((context) => {
        const controller = Use.WebSocket(context);

        controller.acceptUpgrade();
        controller.closed.then((event) => closed.push(event));
      });

      try {
        const client = await connect(app.port);
        const reason = Buffer.from('client done');
        const payload = Buffer.alloc(2 + reason.length);

        payload.writeUInt16BE(1000, 0);
        reason.copy(payload, 2);

        client.stream.write(maskedFrame(OPCODE.CLOSE, payload));
        client.stream.end();

        while (closed.length === 0) {
          await withTimeout(
            new Promise((resolve) => setTimeout(resolve, 10)),
            'close',
          );
        }

        assert.deepEqual(closed[0], { code: 1000, reason: 'client done' });
      } finally {
        await app.close();
      }
    });
    it('should notify an error raised by the connection', async () => {
      const errors = [];

      const app = await serve((context) => {
        const controller = Use.WebSocket(context);

        controller.acceptUpgrade();
        controller.addEventListener('error', (event) => {
          errors.push(event.error);
        });
      });

      try {
        const client = await connect(app.port);

        client.stream.write(Buffer.from([0x8f, 0x00]));

        while (errors.length === 0) {
          await withTimeout(
            new Promise((resolve) => setTimeout(resolve, 10)),
            'error',
          );
        }

        assert.match(String(errors[0]), /masked|RSV|opcode|Invalid/i);

        client.close();
      } finally {
        await app.close();
      }
    });
  });

  describe('.rejectUpgrade', () => {
    it('should answer an http error instead of accepting the stream', async () => {
      const app = await serve((context) => {
        Use.WebSocket(context).rejectUpgrade(403, 'no way');
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
