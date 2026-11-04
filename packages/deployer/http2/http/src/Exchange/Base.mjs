import * as Bridge from '../Bridge.mjs';

export const identity = {
  get: (internal) => internal.stream,
};

export const server = {
  get: ({ internal }) => internal.server,
  protocol: {
    get: () => 'http:',
  },
};

export const httpVersion = {
  get: () => '2.0',
};

export function toHeaderValue(value) {
  if (value === undefined) {
    return undefined;
  }

  return String(value);
}

function readHeader(headers, name) {
  if (headers[name] !== undefined) {
    return headers[name];
  }

  return name === 'host' ? headers[':authority'] : undefined;
}

export const request = {
  method: {
    get: ({ internal }) => internal.headers[':method'],
  },
  URL: {
    get: ({ internal }) => internal.headers[':path'],
  },
  header: {
    get: ({ internal }, key) => {
      return toHeaderValue(readHeader(internal.headers, key.toLowerCase()));
    },
    keys: function* keys({ internal }) {
      for (const key in internal.headers) {
        if (!key.startsWith(':')) {
          yield key;
        }
      }
    },
  },
};

export const response = {
  status: {
    get: ({ internal }) => Bridge.getResponse(internal.stream).status,
  },
  statusText: {
    get: ({ internal }) => Bridge.getResponse(internal.stream).statusText,
  },
  finished: {
    is: ({ internal }) => internal.stream.writableEnded,
  },
  header: {
    get: ({ internal }, key) => {
      return Bridge.getResponse(internal.stream).headers.get(key.toLowerCase());
    },
    keys: ({ internal }) => Bridge.getResponse(internal.stream).headers.keys(),
  },
};
