import { Readable } from 'node:stream';

const DEFAULTS = Object.freeze({
  id: null,
  server: null,
  protocol: 'http:',
  mode: 'http',
  httpVersion: '1.1',
  method: 'GET',
  url: 'http://baseline.test/',
  requestHeaders: null,
  responseHeaders: null,
  status: 200,
  statusText: 'OK',
  finished: false,
  body: null,
  socket: null,
  responseBody: null,
});

export function createInternal(patch = {}) {
  const record = { ...DEFAULTS, ...patch };

  record.id ??= {};
  record.requestHeaders ??= new Map();
  record.responseHeaders ??= new Map();
  record.body ??= Readable.from([]);

  return record;
}

export function readHeader(internal, key) {
  return internal.responseHeaders.get(key.toLowerCase());
}

export function writeHeader(internal, key, value) {
  internal.responseHeaders.set(key.toLowerCase(), value);
}

export function deleteHeader(internal, key) {
  internal.responseHeaders.delete(key.toLowerCase());
}

export function listHeaders(internal) {
  return [...internal.responseHeaders.keys()];
}

export function readRequestHeader(internal, key) {
  return internal.requestHeaders.get(key.toLowerCase());
}

export function listRequestHeaders(internal) {
  return [...internal.requestHeaders.keys()];
}

export const exchangeFacts = Object.freeze({
  httpVersion: (internal) => internal.httpVersion,
  identity: (internal) => internal.id,
  mode: (internal) => internal.mode,
  server: (internal) => internal.server,
  protocol: (internal) => internal.protocol,
});

export const requestFacts = Object.freeze({
  method: (internal) => internal.method,
  url: (internal) => internal.url,
  header: readRequestHeader,
  keys: listRequestHeaders,
});

export const responseFacts = Object.freeze({
  status: (internal) => internal.status,
  statusText: (internal) => internal.statusText,
  finished: (internal) => internal.finished,
  setStatus: (internal, code) => {
    internal.status = code;
  },
  setStatusText: (internal, text) => {
    internal.statusText = text;
  },
  header: readHeader,
  keys: listHeaders,
  setHeader: writeHeader,
  deleteHeader: deleteHeader,
});

export const controllerFacts = Object.freeze({
  readyState: (internal) => internal.socket.readyState,
  send: (internal, data) => internal.socket.sent.push(data),
  close: (internal, code, reason) => {
    internal.socket.closed = { code, reason };
  },
});
