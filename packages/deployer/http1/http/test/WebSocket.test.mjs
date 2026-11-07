import * as http from 'node:http';
import { connect as netConnect } from 'node:net';
import { Readable } from 'node:stream';

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { WebSocket } from 'ws';

import Distributor from './Distributor.mjs';
import * as Kit from '@produck/kit';
import { Abstract, SYMBOL, Use } from '@produck/kitty-workflow';
import * as Http1Http from '@produck/kitty-deployer-http1-http';
import * as WebSocketExchange from '@produck/kitty-deployer-http1-http/exchange/websocket';

const Deployer = Http1Http.Deployer.Http1HttpDeployer;
const WithWebSocket = Deployer.withWebSocketExchange(
  WebSocketExchange.Exchange,
);

const TIMEOUT = 3000;

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
  const server = http.createServer();
  const sockets = new Set();

  server.on('connection', (socket) => sockets.add(socket));
  await workflow.withDeployer(WithWebSocket).deploy(server);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

  const { port } = server.address();

  return {
    origin: `ws://127.0.0.1:${port}`,
    port,
    close() {
      for (const socket of sockets) {
        socket.destroy();
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

function createClient(origin, path = '/') {
  const socket = new WebSocket(`${origin}${path}`);
  const inbox = [];
  const closings = [];
  const waiters = [];

  const notify = () => waiters.splice(0).forEach((wake) => wake());

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
      await new Promise((resolve) => waiters.push(resolve));
    }

    return queue.shift();
  }

  const ready = withTimeout(
    new Promise((resolve, reject) => {
      socket.once('open', resolve);
      socket.once('error', reject);
    }),
    'handshake',
  );

  return {
    socket,
    ready,
    nextMessage: () => withTimeout(take(inbox), 'message'),
    nextClose: () => withTimeout(take(closings), 'close'),
  };
}

async function waitFor(check) {
  const deadline = Date.now() + TIMEOUT;

  while (!check()) {
    if (Date.now() > deadline) {
      throw new Error('wait timeout');
    }

    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}

function upgradeSocket(port) {
  return netConnect(port, '127.0.0.1').on('error', () => {});
}

function writeUpgrade(socket, path = '/raw') {
  socket.write(
    [
      `GET ${path} HTTP/1.1`,
      'Host: 127.0.0.1',
      'Upgrade: websocket',
      'Connection: Upgrade',
      'Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==',
      'Sec-WebSocket-Version: 13',
      '',
      '',
    ].join('\r\n'),
  );
}

function readHead(socket) {
  return new Promise((resolve) => {
    let text = '';

    socket.on('data', function onData(chunk) {
      text += chunk.toString('latin1');

      if (text.includes('\r\n\r\n')) {
        socket.off('data', onData);
        resolve(text);
      }
    });
  });
}

describe('WebSocket', () => {
  describe('::withWebSocketExchange()', () => {
    it('should tag the deployer and bind the exchange class', () => {
      assert.equal(WithWebSocket[SYMBOL.DEPLOYER._S.TAG], '1:http,websocket');
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
    it('should accept the handshake and echo a text frame', async () => {
      const app = await serve((context) => {
        const controller = Use.WebSocket(context);

        controller.acceptUpgrade();
        controller.addEventListener('message', (event) => {
          assert.equal(typeof event.data, 'string');
          controller.send(event.data.toUpperCase());
        });
      });

      try {
        const client = createClient(app.origin);

        await client.ready;
        client.socket.send('hello');

        const received = await client.nextMessage();

        assert.equal(String(received.data), 'HELLO');
        assert.equal(received.isBinary, false);

        client.socket.terminate();
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
        const client = createClient(app.origin);

        await client.ready;
        client.socket.send(Buffer.from('binary'));

        const received = await client.nextMessage();

        assert.equal(received.isBinary, true);
        assert.equal(received.data.toString('utf8'), 'binary');

        client.socket.terminate();
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
        const client = createClient(app.origin);

        await client.ready;

        const received = await client.nextMessage();

        assert.equal(String(received.data), '1');

        client.socket.terminate();
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
        const client = createClient(app.origin);

        await client.ready;
        client.socket.send('bye');

        const close = await client.nextClose();

        assert.equal(close.code, 1000);
        assert.equal(String(close.reason), 'done');
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
        const client = createClient(app.origin);

        await client.ready;
        client.socket.close(1000, 'client done');

        await waitFor(() => closed.length > 0);

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
        const socket = upgradeSocket(app.port);

        await new Promise((resolve) => socket.once('connect', resolve));
        writeUpgrade(socket);

        assert.match(await readHead(socket), /HTTP\/1\.1 101/);

        socket.write(Buffer.from([0x8f, 0x00]));

        await waitFor(() => errors.length > 0);

        assert.match(String(errors[0]), /RSV|opcode|Invalid/i);
      } finally {
        await app.close();
      }
    });

    it('should report a missing raw request on the websocket exchange', async () => {
      const app = await serve((context) => {
        const controller = Use.WebSocket(context);

        controller.acceptUpgrade();

        try {
          Http1Http.useHttp1Request(context);
          controller.send('kept');
        } catch (error) {
          controller.send(error.message);
        }
      });

      try {
        const client = createClient(app.origin);

        await client.ready;

        const received = await client.nextMessage();

        assert.match(String(received.data), /No raw request is bound/);

        client.socket.terminate();
      } finally {
        await app.close();
      }
    });
  });

  describe('.rejectUpgrade', () => {
    it('should answer an http error instead of switching protocols', async () => {
      const app = await serve((context) => {
        Use.WebSocket(context).rejectUpgrade(403, 'no way');
      });

      try {
        const socket = upgradeSocket(app.port);

        await new Promise((resolve) => socket.once('connect', resolve));
        writeUpgrade(socket);

        const head = await readHead(socket);

        assert.match(head, /HTTP\/1\.1 403 Forbidden/);
        assert.match(head, /Content-Length: 6/);
        assert.match(head, /no way$/);
      } finally {
        await app.close();
      }
    });

    it('should answer the standard phrase by default', async () => {
      const app = await serve((context) => {
        Use.WebSocket(context).rejectUpgrade(400);
      });

      try {
        const socket = upgradeSocket(app.port);

        await new Promise((resolve) => socket.once('connect', resolve));
        writeUpgrade(socket);

        const head = await readHead(socket);

        assert.match(head, /HTTP\/1\.1 400 Bad Request/);
        assert.match(head, /Bad Request$/);
      } finally {
        await app.close();
      }
    });
  });
});
