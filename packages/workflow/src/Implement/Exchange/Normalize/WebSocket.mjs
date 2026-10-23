import { isPlainObject } from 'is-plain-object';
import { ThrowTypeError } from '@produck/argot';

import normalizeBase, { normalizeResponse } from './Base.mjs';

export default function normalizeWebSocket(_options) {
  const $base = normalizeBase(_options);
  const options = {};

  {
    const { controller: _controller } = _options;

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
      options.request = $base.request;
    }

    {
      options.response = normalizeResponse(_options.response);
    }

    if (isPlainObject(_controller)) {
      const controller = (options.controller = {});

      const {
        readyState: _readyState,
        send: _send,
        close: _close,
      } = _controller;

      if (isPlainObject(_readyState)) {
        const readyState = (controller.readyState = {});

        const { get: _get } = _readyState;

        if (typeof _get === 'function') {
          readyState.get = _get;
        } else {
          ThrowTypeError('args[0].controller.readyState.get', 'function');
        }
      } else {
        ThrowTypeError('args[0].controller.readyState', 'plain object');
      }

      if (isPlainObject(_send)) {
        const send = (controller.send = {});

        const { send: _sendFn } = _send;

        if (typeof _sendFn === 'function') {
          send.send = _sendFn;
        } else {
          ThrowTypeError('args[0].controller.send.send', 'function');
        }
      } else {
        ThrowTypeError('args[0].controller.send', 'plain object');
      }

      if (isPlainObject(_close)) {
        const close = (controller.close = {});

        const { close: _closeFn } = _close;

        if (typeof _closeFn === 'function') {
          close.close = _closeFn;
        } else {
          ThrowTypeError('args[0].controller.close.close', 'function');
        }
      } else {
        ThrowTypeError('args[0].controller.close', 'plain object');
      }
    } else {
      ThrowTypeError('args[0].controller', 'plain object');
    }
  }

  return options;
}
