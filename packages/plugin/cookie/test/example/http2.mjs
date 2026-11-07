import assert from 'node:assert/strict';
import * as http2 from 'node:http2';
import { Readable } from 'node:stream';

import { SubConstructorProxy as SCP } from '@produck/es-abstract';
import * as Fugue from '@produck/fugue';
import * as Kit from '@produck/kit';
import * as Http2Http from '@produck/kitty-deployer-http2-http';
import { Implement, Use } from '@produck/kitty-workflow';

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
  workflow.withPlugin(Plugin);
  workflow.use((kit) => {
    const cookie = useCookie(kit);
    const theme = cookie.get('theme');

    cookie.set('visited', '1');
    Use.Response(kit).body.data = JSON.stringify({
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

function request(port, headers = {}) {
  return new Promise((resolve, reject) => {
    const client = http2.connect(`http://127.0.0.1:${port}`);

    client.on('error', reject);

    const stream = client.request({ ':path': '/', ...headers });
    let head = null;
    let body = '';

    stream.setEncoding('utf8');
    stream.on('response', (responseHeader) => (head = responseHeader));
    stream.on('data', (chunk) => (body += chunk));
    stream.on('end', () => {
      client.close();
      resolve({ status: head[':status'], headers: head, body });
    });
    stream.on('error', reject);
    stream.end();
  });
}

const server = http2.createServer();
const workflow = createWorkflow();
const sessions = new Set();

server.on('session', (session) => sessions.add(session));
await workflow.withDeployer(Http2Http.Deployer.Http2Http).deploy(server);
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

const { port } = server.address();

const withCookie = await request(port, { cookie: 'theme=dark' });
const withoutCookie = await request(port);

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
console.log('http2 ok');

for (const session of sessions) {
  session.destroy();
}

await new Promise((resolve) => server.close(resolve));
