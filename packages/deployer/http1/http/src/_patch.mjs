// TODO remove once the framework settles the default empty and error responses

const WRITING = new WeakSet();

export function markWritten(res) {
  WRITING.add(res);
}

export function written(res) {
  return WRITING.has(res);
}

export function finish(res) {
  if (written(res) || res.writableEnded) {
    return;
  }

  res.end();
}

export function fail(res) {
  if (written(res) || res.headersSent) {
    res.destroy();

    return;
  }

  res.statusCode = 500;
  res.statusMessage = 'Internal Server Error';
  res.end();
}
