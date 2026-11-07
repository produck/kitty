import * as https from 'node:https';
import { Readable } from 'node:stream';

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { WebSocket } from 'ws';

import * as Kit from '@produck/kit';
import { Abstract, SYMBOL, Use } from '@produck/kitty-workflow';
import * as Http1Https from '@produck/kitty-deployer-http1-https';
import { Exchange as WebSocketExchange } from '@produck/kitty-deployer-http1-http/exchange/websocket';

import credentials from './credentials.mjs';
import Distributor from './Distributor.mjs';

const Deployer = Http1Https.Deployer.Http1HttpsDeployer;
const WithWebSocket = Deployer.withWebSocketExchange(WebSocketExchange);

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

async function serve(handler) {
  const workflow = new Workflow(Kit.global);

  workflow.setRequestBodyDistributorConstructor(Distributor);
  workflow.use(handler);
  workflow.finalize();

  const server = https.createServer(credentials);

  await workflow.withDeployer(WithWebSocket).deploy(server);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

  const { port } = server.address();

  return {
    origin: `wss://127.0.0.1:${port}`,
    close() {
      server.closeAllConnections();

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

function createClient(origin) {
  const socket = new WebSocket(origin, { rejectUnauthorized: false });
  const inbox = [];
  const waiters = [];

  socket.on('message', (data, isBinary) => {
    inbox.push({ data, isBinary });
    waiters.splice(0).forEach((wake) => wake());
  });

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
    async nextMessage() {
      while (inbox.length === 0) {
        await withTimeout(
          new Promise((resolve) => waiters.push(resolve)),
          'message',
        );
      }

      return inbox.shift();
    },
  };
}

describe('WebSocket', () => {
  describe('.handleUpgrade', () => {
    it('should accept the secure handshake and echo a text frame', async () => {
      const app = await serve((context) => {
        const controller = Use.WebSocket(context);

        controller.acceptUpgrade();
        controller.addEventListener('message', (event) => {
          controller.send(event.data.toUpperCase());
        });
      });

      try {
        const client = createClient(app.origin);

        await client.ready;
        client.socket.send('secure');

        const received = await client.nextMessage();

        assert.equal(String(received.data), 'SECURE');
        assert.equal(received.isBinary, false);

        client.socket.terminate();
      } finally {
        await app.close();
      }
    });
  });
});
