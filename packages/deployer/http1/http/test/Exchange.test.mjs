import * as http from 'node:http';
import { Readable } from 'node:stream';

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import Distributor from './Distributor.mjs';
import * as Kit from '@produck/kit';
import {
  Abstract,
  SYMBOL,
  useExchange,
  useRequest,
  useResponse,
} from '@produck/kitty-workflow';

import { Deployer } from '@produck/kitty-deployer-http1-http';

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

  if (handler !== undefined) {
    workflow.use(handler);
  }

  return workflow.finalize();
}

async function listen(server) {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

  const { port } = server.address();

  return `http://127.0.0.1:${port}`;
}

async function serve(handler, options = {}) {
  const { compile = false } = options;
  const workflow = createWorkflow(handler);
  const server = http.createServer();
  const oneTime = workflow.withDeployer(Deployer);
  let manifest = null;

  if (compile) {
    const deployment = await oneTime.compile(server);

    manifest = deployment.manifest;
    server.on('request', manifest['request-listener']);
  } else {
    await oneTime.deploy(server);
  }

  const origin = await listen(server);

  return {
    manifest,
    origin,
    close() {
      return new Promise((resolve) => server.close(resolve));
    },
  };
}

describe('Exchange', () => {
  describe('.response.body', () => {
    it('should write a body with a declared length', async () => {
      const app = await serve((context) => {
        const response = useResponse(context);

        response.setStatus(201, 'Created');
        response.header.set('x-method', 'GET');
        response.body.data = 'hello';
      });

      try {
        const res = await fetch(`${app.origin}/hello?name=kitty`);

        assert.equal(res.status, 201);
        assert.equal(res.statusText, 'Created');
        assert.equal(res.headers.get('x-method'), 'GET');
        assert.equal(res.headers.get('content-length'), '5');
        assert.equal(await res.text(), 'hello');
      } finally {
        await app.close();
      }
    });

    it('should fall back to the default status when no body is written', async () => {
      const app = await serve(() => {});

      try {
        const res = await fetch(`${app.origin}/empty`);

        assert.equal(res.status, 200);
        assert.equal(await res.text(), '');
      } finally {
        await app.close();
      }
    });

    it('should end an explicitly empty body', async () => {
      const app = await serve((context) => {
        useResponse(context).body.data = null;
      });

      try {
        const res = await fetch(`${app.origin}/null`);

        assert.equal(res.status, 200);
        assert.equal(res.headers.get('content-length'), '0');
        assert.equal(await res.text(), '');
      } finally {
        await app.close();
      }
    });
  });

  describe('.request', () => {
    it('should expose method, url and the request body', async () => {
      const app = await serve(async (context) => {
        const request = useRequest(context);
        const response = useResponse(context);
        const body = await new Response(request.body.data).text();

        response.body.data = [
          request.method,
          request.url.pathname,
          request.url.search,
          body,
        ].join(' ');
      });

      try {
        const res = await fetch(`${app.origin}/echo?a=1`, {
          body: 'payload',
          method: 'POST',
        });

        assert.equal(await res.text(), 'POST /echo ?a=1 payload');
      } finally {
        await app.close();
      }
    });

    it('should read a header and list the header names', async () => {
      const app = await serve((context) => {
        const request = useRequest(context);
        const response = useResponse(context);
        const absent = request.header.get('x-absent');
        const keys = request.header.keys();
        const listed = [...keys].includes('x-present');

        response.body.data = [
          absent === undefined ? 'absent' : 'present',
          request.header.get('x-present'),
          listed ? 'listed' : 'unlisted',
        ].join(' ');
      });

      try {
        const res = await fetch(`${app.origin}/header`, {
          headers: { 'x-present': 'value' },
        });

        assert.equal(await res.text(), 'absent value listed');
      } finally {
        await app.close();
      }
    });
  });

  describe('.response.header', () => {
    it('should normalize stored header values', async () => {
      const app = await serve((context) => {
        const response = useResponse(context);

        response.header.set('set-cookie', 'a=1');
        response.header.set('x-plain', 'plain');

        const cookie = response.header.get('set-cookie');
        const plain = response.header.get('x-plain');
        const absent = response.header.get('x-absent');

        response.header.delete('x-plain');

        response.body.data = [cookie, plain, absent].join('|');
      });

      try {
        const res = await fetch(`${app.origin}/header`);

        assert.equal(await res.text(), 'a=1|plain|');
        assert.equal(res.headers.get('x-plain'), null);
      } finally {
        await app.close();
      }
    });
  });

  describe('connection facts', () => {
    it('should expose server, protocol and version', async () => {
      const app = await serve((context) => {
        const exchange = useExchange(context);
        const response = useResponse(context);

        response.header.set('x-a', '1');
        exchange.setStatus(202, 'Accepted');

        response.body.data = [
          exchange.server.constructor.name,
          exchange.protocol,
          exchange.httpVersion,
          [...response.header.keys()].includes('x-a') ? 'has' : 'missing',
          response.isFinished ? 'finished' : 'open',
          exchange.statusCode,
          exchange.statusText,
        ].join(' ');
      });

      try {
        const res = await fetch(`${app.origin}/facts`);

        assert.equal(res.status, 202);
        assert.equal(
          await res.text(),
          'Server http: 1.1 has open 202 Accepted',
        );
        assert.equal(res.headers.get('x-a'), '1');
      } finally {
        await app.close();
      }
    });
  });

  describe('pipeline failure', () => {
    it('should answer 500 when nothing was written', async () => {
      const app = await serve(() => {
        throw new Error('boom');
      });

      try {
        const res = await fetch(`${app.origin}/boom`);

        assert.equal(res.status, 500);
        assert.equal(res.statusText, 'Internal Server Error');
      } finally {
        await app.close();
      }
    });

    it('should drop the connection when the response was already written', async () => {
      const app = await serve((context) => {
        useResponse(context).body.data = 'partial';

        throw new Error('boom');
      });

      try {
        await assert.rejects(fetch(`${app.origin}/partial`));
      } finally {
        await app.close();
      }
    });
  });

  describe('compile()', () => {
    it('should expose the request listener as manifest material', async () => {
      const app = await serve(
        (context) => {
          useResponse(context).body.data = 'compiled';
        },
        { compile: true },
      );

      try {
        assert.equal(typeof app.manifest['request-listener'], 'function');

        const res = await fetch(`${app.origin}/compiled`);

        assert.equal(await res.text(), 'compiled');
      } finally {
        await app.close();
      }
    });
  });
});
