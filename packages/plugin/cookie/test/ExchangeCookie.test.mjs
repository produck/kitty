import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Tune } from '@produck/kitty-plugin-cookie';

import { installConfiguration } from '../src/Configuration.mjs';
import { Concrete as ExchangeCookie } from '../src/ExchangeCookie/index.mjs';

function createExchange(options = {}) {
  const { cookie, defaults = {}, installed = true, mode = 'http' } = options;
  const state = { cookie, appended: [] };
  const workflow = {};

  if (installed) {
    installConfiguration(workflow);
  }

  for (const [name, value] of Object.entries(defaults)) {
    Tune[name](workflow, value);
  }

  const exchange = {
    mode,
    workflow,
    request: {
      header: {
        get: (name) => (name === 'cookie' ? state.cookie : undefined),
      },
    },
  };

  if (mode === 'http') {
    exchange.response = {
      header: {
        append: (name, value) => state.appended.push([name, value]),
      },
    };
  }

  return { exchange, state, workflow };
}

describe('.get()', () => {
  it('should read the request cookie header', () => {
    const { exchange } = createExchange({ cookie: 'a=1' });
    const cookie = new ExchangeCookie(exchange);

    assert.deepEqual(cookie.get('a'), { name: 'a', value: '1' });
  });

  it('should answer an empty record set without the header', () => {
    const { exchange } = createExchange();
    const cookie = new ExchangeCookie(exchange);

    assert.equal(cookie.size, 0);
  });
});

describe('.set()', () => {
  it('should reject a workflow without the plugin', () => {
    const { exchange } = createExchange({ installed: false });
    const cookie = new ExchangeCookie(exchange);

    assert.throws(() => cookie.set('a', '1'));
  });

  it('should append one set-cookie line', () => {
    const { exchange, state } = createExchange();
    const cookie = new ExchangeCookie(exchange);

    cookie.set('a', '1');

    assert.deepEqual(state.appended, [
      ['set-cookie', 'a=1; Path=/; HttpOnly; SameSite=Lax'],
    ]);
  });

  it('should apply the workflow configuration', () => {
    const { exchange, state } = createExchange({
      defaults: {
        Domain: 'example.com',
        MaxAge: 60,
        Expires: new Date(Date.UTC(2020, 0, 1)),
      },
    });
    const cookie = new ExchangeCookie(exchange);

    cookie.set('a', '1');

    assert.deepEqual(state.appended, [
      [
        'set-cookie',
        'a=1; Expires=Wed, 01 Jan 2020 00:00:00 GMT; Max-Age=60; ' +
          'Domain=example.com; Path=/; HttpOnly; SameSite=Lax',
      ],
    ]);
  });

  it('should prefer the call options over the configuration', () => {
    const { exchange, state } = createExchange({
      defaults: { Domain: 'example.com' },
    });
    const cookie = new ExchangeCookie(exchange);

    cookie.set('a', '1', { domain: 'other.test' });

    assert.deepEqual(state.appended, [
      ['set-cookie', 'a=1; Domain=other.test; Path=/; HttpOnly; SameSite=Lax'],
    ]);
  });

  it('should read the configuration at every call', () => {
    const { exchange, state, workflow } = createExchange();
    const cookie = new ExchangeCookie(exchange);

    cookie.set('a', '1');
    Tune.Domain(workflow, 'example.com');
    cookie.set('b', '2');

    assert.deepEqual(state.appended, [
      ['set-cookie', 'a=1; Path=/; HttpOnly; SameSite=Lax'],
      ['set-cookie', 'b=2; Domain=example.com; Path=/; HttpOnly; SameSite=Lax'],
    ]);
  });

  it('should read the cookie of a websocket upgrade request', () => {
    const { exchange } = createExchange({ cookie: 'a=1', mode: 'websocket' });
    const cookie = new ExchangeCookie(exchange);

    assert.deepEqual(cookie.get('a'), { name: 'a', value: '1' });
  });

  it('should reject a write on a websocket exchange', () => {
    const { exchange, state } = createExchange({ mode: 'websocket' });
    const cookie = new ExchangeCookie(exchange);

    assert.throws(() => cookie.set('a', '1'));
    assert.equal(state.appended.length, 0);
  });
});
