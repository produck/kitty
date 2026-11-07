import assert from 'node:assert/strict';
import * as http from 'node:http';
import { Readable } from 'node:stream';
import { after, before, describe, it } from 'node:test';

import * as Fugue from '@produck/fugue';
import * as Kit from '@produck/kit';
import * as Deployer from '@produck/kitty-deployer-http1-http';
import { Implement, useResponse } from '@produck/kitty-workflow';
import { SubConstructorProxy as SCP } from '@produck/es-abstract';

import { Plugin, Tune, useCookie } from '@produck/kitty-plugin-cookie';

const Distributor = SCP(class Distributor extends Fugue.Distributor {});

function normalizeHttpResponseBodyData(value) {
  if (value === undefined) {
    return { stream: null, length: 0 };
  }

  const data = Buffer.from(String(value));

  return { stream: Readable.toWeb(Readable.from(data)), length: data.length };
}

function createWorkflow() {
  const Workflow = Implement.Workflow({ normalizeHttpResponseBodyData });

  Workflow.DeployerRegistry.register(Deployer.Deployer.Http1Http);

  const workflow = new Workflow(Kit.global);

  workflow.setRequestBodyDistributorConstructor(Distributor);
  workflow.withPlugin(Plugin);
  workflow.use((kit) => {
    const cookie = useCookie(kit);
    const theme = cookie.get('theme');

    cookie.set('visited', '1');
    useResponse(kit).body.data = theme === undefined ? 'none' : theme.value;
  });

  return workflow;
}

function request(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, { headers }, (res) => {
      const chunkList = [];

      res.on('data', (chunk) => chunkList.push(chunk));
      res.on('end', () =>
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: Buffer.concat(chunkList).toString(),
        }),
      );
    });

    req.on('error', reject);
    req.end();
  });
}

describe('::Plugin', () => {
  const state = { server: null, workflow: null, url: null };

  before(async () => {
    const server = http.createServer();
    const workflow = createWorkflow();

    workflow.finalize();
    await workflow.deploy(server);
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

    state.server = server;
    state.workflow = workflow;
    state.url = `http://127.0.0.1:${server.address().port}/`;
  });

  after(async () => {
    await new Promise((resolve) => state.server.close(resolve));
  });

  it('should read the request cookie and write the default line', async () => {
    const response = await request(state.url, { cookie: 'theme=dark' });

    assert.equal(response.body, 'dark');
    assert.deepEqual(response.headers['set-cookie'], [
      'visited=1; Path=/; HttpOnly; SameSite=Lax',
    ]);
  });

  it('should answer the handler without a request cookie', async () => {
    const response = await request(state.url);

    assert.equal(response.body, 'none');
  });

  it('should apply the tuned workflow defaults', async () => {
    Tune.Domain(state.workflow, 'example.com');
    Tune.MaxAge(state.workflow, 60);

    const response = await request(state.url);

    assert.deepEqual(response.headers['set-cookie'], [
      'visited=1; Max-Age=60; Domain=example.com; Path=/; ' +
        'HttpOnly; SameSite=Lax',
    ]);
  });
});
