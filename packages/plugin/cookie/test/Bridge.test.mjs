import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Bridge from '../src/Bridge.mjs';

function createExchange(options = {}) {
  const { cookie, response = true } = options;
  const state = { cookie, appended: [] };

  const exchange = {
    request: {
      header: {
        get: (name) => (name === 'cookie' ? state.cookie : undefined),
      },
    },
  };

  if (response) {
    exchange.response = {
      header: {
        append: (name, value) => state.appended.push([name, value]),
      },
    };
  }

  return { exchange, state };
}

describe('::get()', () => {
  it('should answer one instance per exchange', () => {
    const { exchange } = createExchange();

    assert.equal(Bridge.get(exchange), Bridge.get(exchange));
  });

  it('should answer a distinct instance for another exchange', () => {
    assert.notEqual(
      Bridge.get(createExchange().exchange),
      Bridge.get(createExchange().exchange),
    );
  });
});

describe('.get()', () => {
  it('should read the request cookie header', () => {
    const { exchange } = createExchange({ cookie: 'a=1' });

    assert.deepEqual(Bridge.get(exchange).get('a'), { name: 'a', value: '1' });
  });

  it('should answer an empty record set without the header', () => {
    const { exchange } = createExchange();

    assert.equal(Bridge.get(exchange).size, 0);
  });
});

describe('.set()', () => {
  it('should append one set-cookie line', () => {
    const { exchange, state } = createExchange();

    Bridge.get(exchange).set('a', '1');

    assert.deepEqual(state.appended, [
      ['set-cookie', 'a=1; Path=/; HttpOnly; SameSite=Lax'],
    ]);
  });

  it('should reject a write without a response', () => {
    const { exchange } = createExchange({ response: false });

    assert.throws(() => Bridge.get(exchange).set('a', '1'));
  });
});
