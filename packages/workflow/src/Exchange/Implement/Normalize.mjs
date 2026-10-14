import { isPlainObject } from 'is-plain-object';
import { ThrowTypeError } from '@produck/argot';

export default function normalize(options) {
  const _options = {};

  if (isPlainObject(options)) {
    const {
      identity: _identity,
      server: _server,
      httpVersion: _httpVersion,
      request: _request,
      response: _response,
    } = options;

    if (isPlainObject(_identity)) {
      const identity = (_options.identity = {});

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
      const server = (_options.server = {});

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
      const httpVersion = (_options.httpVersion = {});

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
      const request = (_options.request = {});

      const {
        mode: _mode,
        method: _method,
        URL: _URL,
        header: _header,
        body: _body,
      } = _request;

      if (isPlainObject(_mode)) {
        const mode = (request.mode = {});

        const { get: _get } = _mode;

        if (typeof _get === 'function') {
          mode.get = _get;
        } else {
          ThrowTypeError('args[0].request.mode.get', 'function');
        }
      } else {
        ThrowTypeError('args[0].request.mode', 'plain object');
      }

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

      if (isPlainObject(_body)) {
        const body = (request.body = {});

        const { source: _source } = _body;

        if (isPlainObject(_source)) {
          const source = (body.source = {});

          const { get: _get } = _source;

          if (typeof _get === 'function') {
            source.get = _get;
          } else {
            ThrowTypeError('args[0].request.body.source.get', 'function');
          }
        } else {
          ThrowTypeError('args[0].request.body.source', 'plain object');
        }
      } else {
        ThrowTypeError('args[0].request.body', 'plain object');
      }
    } else {
      ThrowTypeError('args[0].request', 'plain object');
    }

    if (isPlainObject(_response)) {
      const response = (_options.response = {});

      const {
        status: _status,
        statusText: _statusText,
        finished: _finished,
        header: _header,
        body: _body,
      } = _response;

      if (isPlainObject(_status)) {
        const status = (response.status = {});

        const { get: _get, set: _set } = _status;

        if (typeof _get === 'function') {
          status.get = _get;
        } else {
          ThrowTypeError('args[0].response.status.get', 'function');
        }

        if (typeof _set === 'function') {
          status.set = _set;
        } else {
          ThrowTypeError('args[0].response.status.set', 'function');
        }
      } else {
        ThrowTypeError('args[0].response.status', 'plain object');
      }

      if (isPlainObject(_statusText)) {
        const statusText = (response.statusText = {});

        const { get: _get, set: _set } = _statusText;

        if (typeof _get === 'function') {
          statusText.get = _get;
        } else {
          ThrowTypeError('args[0].response.statusText.get', 'function');
        }

        if (typeof _set === 'function') {
          statusText.set = _set;
        } else {
          ThrowTypeError('args[0].response.statusText.set', 'function');
        }
      } else {
        ThrowTypeError('args[0].response.statusText', 'plain object');
      }

      if (isPlainObject(_finished)) {
        const finished = (response.finished = {});

        const { is: _is } = _finished;

        if (typeof _is === 'function') {
          finished.is = _is;
        } else {
          ThrowTypeError('args[0].response.finished.is', 'function');
        }
      } else {
        ThrowTypeError('args[0].response.finished', 'plain object');
      }

      if (isPlainObject(_header)) {
        const header = (response.header = {});

        const { get: _get, keys: _keys, set: _set, delete: _delete } = _header;

        if (typeof _get === 'function') {
          header.get = _get;
        } else {
          ThrowTypeError('args[0].response.header.get', 'function');
        }

        if (typeof _keys === 'function') {
          header.keys = _keys;
        } else {
          ThrowTypeError('args[0].response.header.keys', 'function');
        }

        if (typeof _set === 'function') {
          header.set = _set;
        } else {
          ThrowTypeError('args[0].response.header.set', 'function');
        }

        if (typeof _delete === 'function') {
          header.delete = _delete;
        } else {
          ThrowTypeError('args[0].response.header.delete', 'function');
        }
      } else {
        ThrowTypeError('args[0].response.header', 'plain object');
      }

      if (isPlainObject(_body)) {
        const body = (response.body = {});

        const { data: _data } = _body;

        if (isPlainObject(_data)) {
          const data = (body.data = {});

          const { get: _get, set: _set } = _data;

          if (typeof _get === 'function') {
            data.get = _get;
          } else {
            ThrowTypeError('args[0].response.body.data.get', 'function');
          }

          if (typeof _set === 'function') {
            data.set = _set;
          } else {
            ThrowTypeError('args[0].response.body.data.set', 'function');
          }
        } else {
          ThrowTypeError('args[0].response.body.data', 'plain object');
        }
      } else {
        ThrowTypeError('args[0].response.body', 'plain object');
      }
    } else {
      ThrowTypeError('args[0].response', 'plain object');
    }
  } else {
    ThrowTypeError('args[0]', 'plain object');
  }

  return _options;
}
