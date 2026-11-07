import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Kit from '@produck/kit';
import { Implement } from '@produck/kitty-workflow';
import {
  Plugin as MimeTypePlugin,
  useTypeTable,
} from '@produck/kitty-plugin-mime-type';

import { Concrete as ContentNegotiation } from '../src/ContentNegotiation/index.mjs';

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

function createNegotiation(headerMap, typeTable = createTypeTable()) {
  const exchange = {
    request: {
      header: {
        get: (name) => headerMap[name],
      },
    },
  };

  return new ContentNegotiation(exchange, typeTable);
}

describe('.accept()', () => {
  it('should answer an exact media type', () => {
    const negotiation = createNegotiation({ accept: 'application/json' });

    assert.equal(
      negotiation.accept('application/json', 'text/html'),
      'application/json',
    );
  });

  it('should prefer the higher quality', () => {
    const negotiation = createNegotiation({
      accept: 'text/html;q=0.5, application/json',
    });

    assert.equal(
      negotiation.accept('text/html', 'application/json'),
      'application/json',
    );
  });

  it('should match any media type', () => {
    const negotiation = createNegotiation({ accept: '*/*' });

    assert.equal(negotiation.accept('text/html', 'text/plain'), 'text/html');
  });

  it('should match a type wildcard', () => {
    const negotiation = createNegotiation({ accept: 'text/*' });

    assert.equal(
      negotiation.accept('application/json', 'text/plain'),
      'text/plain',
    );
  });

  it('should match a wildcard candidate', () => {
    const negotiation = createNegotiation({ accept: 'text/html' });

    assert.equal(negotiation.accept('application/json', 'text/*'), 'text/*');
  });

  it('should expand an alias through the type table', () => {
    const negotiation = createNegotiation({ accept: 'application/json' });

    assert.equal(negotiation.accept('json', 'text/html'), 'json');
  });

  it('should answer false without an acceptable candidate', () => {
    const negotiation = createNegotiation({ accept: 'image/png' });

    assert.equal(negotiation.accept('json', 'text/html'), false);
  });

  it('should answer false for an alias missing in the type table', () => {
    const negotiation = createNegotiation({ accept: 'application/json' });

    assert.equal(negotiation.accept('unknown'), false);
  });

  it('should reject an excluded candidate', () => {
    const negotiation = createNegotiation({ accept: 'application/json;q=0' });

    assert.equal(negotiation.accept('application/json'), false);
  });

  it('should treat an invalid quality as zero', () => {
    const negotiation = createNegotiation({ accept: 'application/json;q' });

    assert.equal(negotiation.accept('application/json'), false);
  });

  it('should treat a non numeric quality as zero', () => {
    const negotiation = createNegotiation({
      accept: 'application/json;q=abc',
    });

    assert.equal(negotiation.accept('application/json'), false);
  });

  it('should treat a negative quality as zero', () => {
    const negotiation = createNegotiation({ accept: 'application/json;q=-1' });

    assert.equal(negotiation.accept('application/json'), false);
  });

  it('should clamp a quality above one', () => {
    const negotiation = createNegotiation({ accept: 'application/json;q=2' });

    assert.equal(negotiation.accept('application/json'), 'application/json');
  });

  it('should answer false for a malformed media range', () => {
    const negotiation = createNegotiation({ accept: 'json' });

    assert.equal(negotiation.accept('application/json'), false);
  });

  it('should match an any-type candidate', () => {
    const negotiation = createNegotiation({ accept: 'text/html' });

    assert.equal(negotiation.accept('*/*'), '*/*');
  });

  it('should answer the first candidate without an accept header', () => {
    const negotiation = createNegotiation({});

    assert.equal(negotiation.accept('text/html', 'text/plain'), 'text/html');
  });
});

describe('.acceptEncoding()', () => {
  it('should answer an offered encoding', () => {
    const negotiation = createNegotiation({ 'accept-encoding': 'gzip, br' });

    assert.equal(negotiation.acceptEncoding('br', 'deflate'), 'br');
  });

  it('should prefer the higher quality', () => {
    const negotiation = createNegotiation({
      'accept-encoding': 'gzip;q=0.5, br',
    });

    assert.equal(negotiation.acceptEncoding('gzip', 'br'), 'br');
  });

  it('should match any encoding', () => {
    const negotiation = createNegotiation({ 'accept-encoding': '*' });

    assert.equal(negotiation.acceptEncoding('gzip'), 'gzip');
  });

  it('should answer false without an acceptable encoding', () => {
    const negotiation = createNegotiation({ 'accept-encoding': 'gzip' });

    assert.equal(negotiation.acceptEncoding('br'), false);
  });

  it('should answer the first candidate without an encoding header', () => {
    const negotiation = createNegotiation({});

    assert.equal(negotiation.acceptEncoding('br', 'gzip'), 'br');
  });

  it('should skip an empty list entry', () => {
    const negotiation = createNegotiation({ 'accept-encoding': ', gzip' });

    assert.equal(negotiation.acceptEncoding('gzip'), 'gzip');
  });
});

describe('.acceptCharset()', () => {
  it('should prefer the higher quality', () => {
    const negotiation = createNegotiation({
      'accept-charset': 'utf-8, iso-8859-1;q=0.5',
    });

    assert.equal(negotiation.acceptCharset('iso-8859-1', 'utf-8'), 'utf-8');
  });

  it('should compare case-insensitively', () => {
    const negotiation = createNegotiation({ 'accept-charset': 'UTF-8' });

    assert.equal(negotiation.acceptCharset('utf-8'), 'utf-8');
  });

  it('should answer false without an acceptable charset', () => {
    const negotiation = createNegotiation({ 'accept-charset': 'utf-8' });

    assert.equal(negotiation.acceptCharset('gbk'), false);
  });
});

describe('.acceptLanguage()', () => {
  it('should prefer the higher quality', () => {
    const negotiation = createNegotiation({
      'accept-language': 'zh-CN, en;q=0.8',
    });

    assert.equal(negotiation.acceptLanguage('en', 'zh-CN'), 'zh-CN');
  });

  it('should match a language prefix', () => {
    const negotiation = createNegotiation({ 'accept-language': 'zh' });

    assert.equal(negotiation.acceptLanguage('zh-CN'), 'zh-CN');
  });

  it('should match any language', () => {
    const negotiation = createNegotiation({ 'accept-language': '*' });

    assert.equal(negotiation.acceptLanguage('en'), 'en');
  });

  it('should answer false without an acceptable language', () => {
    const negotiation = createNegotiation({ 'accept-language': 'en' });

    assert.equal(negotiation.acceptLanguage('zh'), false);
  });
});

describe('candidate gate', () => {
  it('should reject an empty candidate list', () => {
    const negotiation = createNegotiation({});

    assert.throws(() => negotiation.accept());
    assert.throws(() => negotiation.acceptEncoding());
    assert.throws(() => negotiation.acceptCharset());
    assert.throws(() => negotiation.acceptLanguage());
  });

  it('should reject a candidate outside the contract', () => {
    const negotiation = createNegotiation({});

    assert.throws(() => negotiation.accept(1), { message: /args\[0\]/ });
    assert.throws(() => negotiation.accept(''), { message: /args\[0\]/ });
    assert.throws(() => negotiation.accept('json', 1), {
      message: /args\[1\]/,
    });
  });
});
