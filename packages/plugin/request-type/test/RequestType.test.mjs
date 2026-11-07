import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Kit from '@produck/kit';
import { Implement } from '@produck/kitty-workflow';
import {
  Plugin as MimeTypePlugin,
  useTypeTable,
} from '@produck/kitty-plugin-mime-type';

import { Concrete as RequestContentTypeAccessor } from '../src/RequestContentTypeAccessor/index.mjs';

function createTypeTable() {
  const Workflow = Implement.Workflow({
    normalizeHttpResponseBodyData: () => ({ stream: null, length: 0 }),
  });
  const workflow = new Workflow(Kit.global);
  let kit = null;

  workflow.withPlugin(MimeTypePlugin);
  workflow.withPlugin(
    Implement.Plugin({
      tag: 'probe',
      install: (PluginKit) => (kit = PluginKit),
    }),
  );

  return useTypeTable(kit);
}

function createRequestType(contentType, typeTable = createTypeTable()) {
  const exchange = {
    request: {
      header: {
        get: (name) => (name === 'content-type' ? contentType : undefined),
      },
    },
  };

  return new RequestContentTypeAccessor(exchange, typeTable);
}

describe('.is()', () => {
  it('should answer the pattern of an exact media type', () => {
    assert.equal(
      createRequestType('application/json').is('application/json'),
      'application/json',
    );
  });

  it('should expand an alias through the type table', () => {
    assert.equal(createRequestType('application/json').is('json'), 'json');
  });

  it('should answer the first matching pattern', () => {
    assert.equal(
      createRequestType('text/plain').is('json', 'text', 'text/plain'),
      'text',
    );
  });

  it('should match a type wildcard', () => {
    assert.equal(createRequestType('text/html').is('text/*'), 'text/*');
    assert.equal(createRequestType('image/png').is('text/*'), false);
  });

  it('should match any type', () => {
    assert.equal(createRequestType('image/png').is('*/*'), '*/*');
  });

  it('should match a structured suffix', () => {
    assert.equal(
      createRequestType('application/vnd.api+json').is('+json'),
      '+json',
    );
    assert.equal(createRequestType('application/json').is('+json'), false);
  });

  it('should reject an empty pattern list', () => {
    assert.throws(() => createRequestType('application/json').is());
    assert.throws(() => createRequestType(undefined).is());
  });

  it('should answer false without a content type', () => {
    assert.equal(createRequestType(undefined).is('json'), false);
    assert.equal(createRequestType(undefined).is('*/*'), false);
  });

  it('should answer false for a malformed content type', () => {
    assert.equal(createRequestType('plain').is('*/*'), false);
    assert.equal(createRequestType('text/').is('*/*'), false);
  });

  it('should reject a pattern outside the contract', () => {
    assert.throws(() => createRequestType('application/json').is(1), {
      message: /args\[0\]/,
    });
    assert.throws(() => createRequestType('application/json').is(''), {
      message: /args\[0\]/,
    });
    assert.throws(() => createRequestType('application/json').is('json', 1), {
      message: /args\[1\]/,
    });
  });

  it('should answer false for an unknown alias', () => {
    assert.equal(createRequestType('application/json').is('unknown'), false);
  });
});
