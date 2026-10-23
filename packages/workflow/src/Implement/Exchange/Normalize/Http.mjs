import { isPlainObject } from 'is-plain-object';
import { ThrowTypeError } from '@produck/argot';

import normalizeBase, { normalizeMutableResponse } from './Base.mjs';

export default function normalizeHttp(_options) {
  const $base = normalizeBase(_options);
  const options = {};

  {
    const { request: _request, response: _response } = _options;

    {
      options.identity = $base.identity;
    }

    {
      options.server = $base.server;
    }

    {
      options.httpVersion = $base.httpVersion;
    }

    {
      const request = (options.request = $base.request);
      const { body: _body } = _request;

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
    }

    {
      const response = (options.response = normalizeMutableResponse(_response));
      const { body: _body } = _response;

      if (isPlainObject(_body)) {
        const body = (response.body = {});

        const { data: _data } = _body;

        if (isPlainObject(_data)) {
          const data = (body.data = {});

          const { set: _set } = _data;

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
    } // NO ELSE
  }

  return options;
}
