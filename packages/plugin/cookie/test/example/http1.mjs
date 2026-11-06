import assert from 'node:assert/strict';
import * as http from 'node:http';
import { Readable } from 'node:stream';

import { SubConstructorProxy as SCP } from '@produck/es-abstract';
import * as Fugue from '@produck/fugue';
import * as Kit from '@produck/kit';
import * as Http1Http from '@produck/kitty-deployer-http1-http';
import { Implement, useResponse } from '@produck/kitty-workflow';

import { Get, Plugin, Tune, useCookie } from '@produck/kitty-plugin-cookie';

const Distributor = SCP(class Distributor extends Fugue.Distributor {});

function normalizeHttpResponseBodyData(value) {
  if (value === undefined || value === null) {
    return { stream: null, length: 0 };
  }

  const buffer = Buffer.from(String(value));

  return {
    stream: Readable.toWeb(Readable.from([buffer])),
    length: buffer.length,
  };
}

function createWorkflow() {
  const Workflow = Implement.Workflow({ normalizeHttpResponseBodyData });
  const workflow = new Workflow(Kit.global);

  workflow.setRequestBodyDistributorConstructor(Distributor);
  workflow.mixin(Plugin);
  workflow.use((kit) => {
    const cookie = useCookie(kit);
    const theme = cookie.get('theme');

    cookie.set('visited', '1');
    useResponse(kit).body.data = JSON.stringify({
      theme: theme === undefined ? null : theme.value,
      size: cookie.size,
      names: [...cookie.keys()],
    });
  });

  Tune.Domain(workflow, 'example.com');
  Tune.MaxAge(workflow, 60);
  workflow.finalize();

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

const server = http.createServer();
const workflow = createWorkflow();
const sessions = new Set();

server.on('session', (session) => sessions.add(session));
await workflow.withDeployer(Http1Http.Deployer.Http1Http).deploy(server);
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

const url = `http://127.0.0.1:${server.address().port}/`;

const withCookie = await request(url, { cookie: 'theme=dark' });
const withoutCookie = await request(url);

assert.equal(withCookie.status, 200);
assert.deepEqual(JSON.parse(withCookie.body), {
  theme: 'dark',
  size: 1,
  names: ['theme'],
});
assert.deepEqual(withCookie.headers['set-cookie'], [
  'visited=1; Max-Age=60; Domain=example.com; Path=/; HttpOnly; SameSite=Lax',
]);
assert.deepEqual(JSON.parse(withoutCookie.body), {
  theme: null,
  size: 0,
  names: [],
});

console.log('workflow defaults:', Get.Domain(workflow), Get.MaxAge(workflow));
console.log('with cookie   :', withCookie.body);
console.log('set-cookie    :', withCookie.headers['set-cookie']);
console.log('without cookie:', withoutCookie.body);
console.log('http1 ok');

for (const session of sessions) {
  session.destroy();
}

await new Promise((resolve) => server.close(resolve));
