import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = mkdtempSync(join(tmpdir(), 'kitty-tls-'));

const keyPath = join(dir, 'key.pem');
const certPath = join(dir, 'cert.pem');

execFileSync('openssl', [
  'req',
  '-x509',
  '-newkey',
  'rsa:2048',
  '-nodes',
  '-keyout',
  keyPath,
  '-out',
  certPath,
  '-days',
  '1',
  '-subj',
  '/CN=localhost',
]);

const credentials = {
  key: readFileSync(keyPath),
  cert: readFileSync(certPath),
};

rmSync(dir, { recursive: true, force: true });

export default credentials;
