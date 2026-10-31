export const identity = {
  get: (internal) => internal.req,
};

export const server = {
  get: ({ internal }) => internal.server,
  protocol: {
    get: () => 'http:',
  },
};

export const httpVersion = {
  get: ({ internal }) => internal.req.httpVersion,
};

export function toHeaderValue(value) {
  return value === undefined ? undefined : String(value);
}

export const request = {
  method: {
    get: ({ internal }) => internal.req.method,
  },
  URL: {
    get: ({ internal }) => internal.req.url,
  },
  header: {
    get: ({ internal }, key) => {
      return toHeaderValue(internal.req.headers[key.toLowerCase()]);
    },
    keys: ({ internal }) => Object.keys(internal.req.headers),
  },
};

export const response = {
  status: {
    get: ({ internal }) => internal.res.statusCode,
  },
  statusText: {
    get: ({ internal }) => internal.res.statusMessage,
  },
  finished: {
    is: ({ internal }) => internal.res.writableEnded,
  },
  header: {
    get: ({ internal }, key) => {
      return toHeaderValue(internal.res.getHeader(key));
    },
    keys: ({ internal }) => internal.res.getHeaderNames(),
  },
};
