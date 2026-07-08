import { isPlainObject } from 'is-plain-object';
import { ThrowTypeError } from '@produck/type-error';
import { SubConstructorProxy as SCP } from '@produck/es-abstract';

import AbstractExchange from './Abstract.mjs';
import { _I } from './Symbol.mjs';

function normalizeOptions(options) {
  const _options = {};

  if (isPlainObject(options)) {
    const {
      meta: _meta,
      mode: _mode,
      httpVersion: _httpVersion,
      method: _method,
      URL: _URL,
      status: _status,
      finished: _finished,
      request: _request,
      response: _response,
    } = options;

    if (isPlainObject(_meta)) {
      const meta = (_options.meta = {});

      const { name: _name = '<anonymous>' } = _meta;

      if (typeof _name === 'string') {
        meta.name = _name;
      } else {
        ThrowTypeError('args[0].meta.name', 'string');
      }
    } else {
      ThrowTypeError('args[0].meta', 'plain object');
    }

    if (isPlainObject(_method)) {
      const method = (_options.method = {});

      const { get: _get } = _method;

      if (typeof _get === 'function') {
        method.get = _get;
      } else {
        ThrowTypeError('args[0].method.get', 'function');
      }
    } else {
      ThrowTypeError('args[0].method', 'plain object');
    }

    if (isPlainObject(_mode)) {
      const mode = (_options.mode = {});

      const { get: _get } = _mode;

      if (typeof _get === 'function') {
        mode.get = _get;
      } else {
        ThrowTypeError('args[0].mode.get', 'function');
      }
    } else {
      ThrowTypeError('args[0].mode', 'plain object');
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

    if (isPlainObject(_URL)) {
      const URL = (_options.URL = {});

      const { get: _get } = _URL;

      if (typeof _get === 'function') {
        URL.get = _get;
      } else {
        ThrowTypeError('args[0].URL.get', 'function');
      }
    } else {
      ThrowTypeError('args[0].URL', 'plain object');
    }

    if (isPlainObject(_status)) {
      const status = (_options.status = {});

      const { get: _get, set: _set } = _status;

      if (typeof _get === 'function') {
        status.get = _get;
      } else {
        ThrowTypeError('args[0].status.get', 'function');
      }

      if (typeof _set === 'function') {
        status.set = _set;
      } else {
        ThrowTypeError('args[0].status.set', 'function');
      }
    } else {
      ThrowTypeError('args[0].status', 'plain object');
    }

    if (isPlainObject(_finished)) {
      const finished = (_options.finished = {});

      const { is: _is } = _finished;

      if (typeof _is === 'function') {
        finished.is = _is;
      } else {
        ThrowTypeError('args[0].finished.is', 'function');
      }
    } else {
      ThrowTypeError('args[0].finished', 'plain object');
    }

    if (isPlainObject(_request)) {
      const request = (_options.request = {});

      const { header: _header, body: _body } = _request;

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

        const { data: _data } = _body;

        if (isPlainObject(_data)) {
          const data = (body.data = {});

          const { get: _get } = _data;

          if (typeof _get === 'function') {
            data.get = _get;
          } else {
            ThrowTypeError('args[0].request.body.data.get', 'function');
          }
        } else {
          ThrowTypeError('args[0].request.body.data', 'plain object');
        }
      } else {
        ThrowTypeError('args[0].request.body', 'plain object');
      }
    } else {
      ThrowTypeError('args[0].request', 'plain object');
    }

    if (isPlainObject(_response)) {
      const response = (_options.response = {});

      const { header: _header, body: _body } = _response;

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

export function Implement(options) {
  const {
    meta: _meta,
    method: { get: _getMethod },
    URL: { get: _getURL },
    status: { get: _getStatus, set: _setStatus },
    finished: { is: _isFinished },
    request: {
      header: { get: _getReqHeader, keys: _getReqHeaderKeys },
      body: {
        data: { get: _getReqBodyData },
      },
    },
    response: {
      header: {
        get: _getResHeader,
        keys: _getResHeaderKeys,
        set: _setResHeader,
        delete: _deleteResHeader,
      },
      body: {
        data: { get: _getResBodyData, set: _setResBodyData },
      },
    },
  } = normalizeOptions(options);

  return SCP(
    class ImplementedExchange extends AbstractExchange {
      static get meta() {
        return { ..._meta };
      }

      [_I.REQUEST.METHOD.GET]() {
        return _getMethod(this);
      }

      [_I.REQUEST.URL.GET]() {
        return _getURL(this);
      }

      [_I.STATUS.GET]() {
        return _getStatus(this);
      }

      [_I.STATUS.SET](value) {
        _setStatus(this, value);
      }

      [_I.FINISHED.IS]() {
        return _isFinished(this);
      }

      [_I.REQUEST.HEADER.GET](key) {
        return _getReqHeader(this, key);
      }

      [_I.REQUEST.HEADER.KEYS]() {
        return _getReqHeaderKeys(this);
      }

      [_I.REQUEST.BODY.DATA.GET]() {
        return _getReqBodyData(this);
      }

      [_I.RESPONSE.HEADER.GET](key) {
        return _getResHeader(this, key);
      }

      [_I.RESPONSE.HEADER.KEYS]() {
        return _getResHeaderKeys(this);
      }

      [_I.RESPONSE.HEADER.SET](key, value) {
        _setResHeader(this, key, value);
      }

      [_I.RESPONSE.HEADER.DELETE](key) {
        _deleteResHeader(this, key);
      }

      [_I.RESPONSE.BODY.DATA.GET]() {
        return _getResBodyData(this);
      }

      [_I.RESPONSE.BODY.DATA.SET](data) {
        _setResBodyData(this, data);
      }
    },
  );
}
