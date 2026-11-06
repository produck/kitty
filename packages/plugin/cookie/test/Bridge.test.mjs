import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Bridge from '../src/Bridge.mjs';
import { Abstract as Cookie } from '../src/Cookie/index.mjs';

function createExchange() {
  return { workflow: {} };
}

describe('::getCookie()', () => {
  it('should answer a cookie for the exchange', () => {
    assert.ok(Bridge.getCookie(createExchange()) instanceof Cookie);
  });

  it('should answer one instance per exchange', () => {
    const exchange = createExchange();

    assert.equal(Bridge.getCookie(exchange), Bridge.getCookie(exchange));
  });

  it('should answer a distinct instance per exchange', () => {
    assert.notEqual(
      Bridge.getCookie(createExchange()),
      Bridge.getCookie(createExchange()),
    );
  });
});
