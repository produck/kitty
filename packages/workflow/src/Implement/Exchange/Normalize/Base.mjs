import { isPlainObject } from 'is-plain-object';
import { ThrowTypeError } from '@produck/argot';

export function normalizeResponse(_response) {
  if (!isPlainObject(_response)) {
    ThrowTypeError('args[0].response', 'plain object');
  }

  const response = {};
  const {
    status: _status,
    statusText: _statusText,
    finished,
    header,
  } = _response;

  if (isPlainObject(_status)) {
    const { get: _get } = _status;

    if (typeof _get !== 'function') {
      ThrowTypeError('args[0].response.status.get', 'function');
    }

    response.status = { get: _get };
  } else {
    ThrowTypeError('args[0].response.status', 'plain object');
  }

  if (isPlainObject(_statusText)) {
    const { get: _get } = _statusText;

    if (typeof _get !== 'function') {
      ThrowTypeError('args[0].response.statusText.get', 'function');
    }

    response.statusText = { get: _get };
  } else {
    ThrowTypeError('args[0].response.statusText', 'plain object');
  }

  if (isPlainObject(finished)) {
    const { is: _is } = finished;

    if (typeof _is !== 'function') {
      ThrowTypeError('args[0].response.finished.is', 'function');
    }

    response.finished = { is: _is };
  } else {
    ThrowTypeError('args[0].response.finished', 'plain object');
  }

  if (isPlainObject(header)) {
    const { get: _get, keys: _keys } = header;

    if (typeof _get !== 'function') {
      ThrowTypeError('args[0].response.header.get', 'function');
    }

    if (typeof _keys !== 'function') {
      ThrowTypeError('args[0].response.header.keys', 'function');
    }

    response.header = { get: _get, keys: _keys };
  } else {
    ThrowTypeError('args[0].response.header', 'plain object');
  }

  return response;
}

export function normalizeMutableResponse(_response) {
  const response = normalizeResponse(_response);
  const { status: _status, statusText: _statusText, header } = _response;

  const { set: _setStatus } = _status;

  if (typeof _setStatus !== 'function') {
    ThrowTypeError('args[0].response.status.set', 'function');
  }

  const { set: _setStatusText } = _statusText;

  if (typeof _setStatusText !== 'function') {
    ThrowTypeError('args[0].response.statusText.set', 'function');
  }

  const { set: _setHeader, delete: _deleteHeader } = header;

  if (typeof _setHeader !== 'function') {
    ThrowTypeError('args[0].response.header.set', 'function');
  }

  if (typeof _deleteHeader !== 'function') {
    ThrowTypeError('args[0].response.header.delete', 'function');
  }

  response.status.set = _setStatus;
  response.statusText.set = _setStatusText;
  response.header.set = _setHeader;
  response.header.delete = _deleteHeader;

  return response;
}

export default function normalizeBase(_options) {
  const options = {};

  if (isPlainObject(_options)) {
    const {
      identity: _identity,
      server: _server,
      httpVersion: _httpVersion,
      request: _request,
    } = _options;

    if (isPlainObject(_identity)) {
      const identity = (options.identity = {});

      const { get: _get } = _identity;

      if (typeof _get === 'function') {
        identity.get = _get;
      } else {
        ThrowTypeError('args[0].identity.get', 'function');
      }
    } else {
      ThrowTypeError('args[0].identity', 'plain object');
    }

    if (isPlainObject(_server)) {
      const server = (options.server = {});

      const { get: _get, protocol: _protocol } = _server;

      if (typeof _get === 'function') {
        server.get = _get;
      } else {
        ThrowTypeError('args[0].server.get', 'function');
      }

      if (isPlainObject(_protocol)) {
        const protocol = (server.protocol = {});

        const { get: _get } = _protocol;

        if (typeof _get === 'function') {
          protocol.get = _get;
        } else {
          ThrowTypeError('args[0].server.protocol.get', 'function');
        }
      } else {
        ThrowTypeError('args[0].server.protocol', 'plain object');
      }
    } else {
      ThrowTypeError('args[0].server', 'plain object');
    }

    if (isPlainObject(_httpVersion)) {
      const httpVersion = (options.httpVersion = {});

      const { get: _get } = _httpVersion;

      if (typeof _get === 'function') {
        httpVersion.get = _get;
      } else {
        ThrowTypeError('args[0].httpVersion.get', 'function');
      }
    } else {
      ThrowTypeError('args[0].httpVersion', 'plain object');
    }

    if (isPlainObject(_request)) {
      const request = (options.request = {});

      const { method: _method, URL: _URL, header: _header } = _request;

      if (isPlainObject(_method)) {
        const method = (request.method = {});

        const { get: _get } = _method;

        if (typeof _get === 'function') {
          method.get = _get;
        } else {
          ThrowTypeError('args[0].request.method.get', 'function');
        }
      } else {
        ThrowTypeError('args[0].request.method', 'plain object');
      }

      if (isPlainObject(_URL)) {
        const URL = (request.URL = {});

        const { get: _get } = _URL;

        if (typeof _get === 'function') {
          URL.get = _get;
        } else {
          ThrowTypeError('args[0].request.URL.get', 'function');
        }
      } else {
        ThrowTypeError('args[0].request.URL', 'plain object');
      }

      if (isPlainObject(_header)) {
        const header = (request.header = {});

        const { get: _get, keys: _keys } = _header;

        if (typeof _get === 'function') {
          header.get = _get;
        } else {
          ThrowTypeError('args[0].request.header.get', 'function');
        }

        if (typeof _keys === 'function') {
          header.keys = _keys;
        } else {
          ThrowTypeError('args[0].request.header.keys', 'function');
        }
      } else {
        ThrowTypeError('args[0].request.header', 'plain object');
      }
    } else {
      ThrowTypeError('args[0].request', 'plain object');
    }
  } else {
    ThrowTypeError('args[0]', 'plain object');
  }

  return options;
}
