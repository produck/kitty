import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Kit from '@produck/kit';
import { Implement } from '@produck/kitty-workflow';
import {
  Plugin as MimeTypePlugin,
  useTypeTable,
} from '@produck/kitty-plugin-mime-type';
import {
  Plugin as CharsetPlugin,
  useCharset,
} from '@produck/kitty-plugin-charset';

import { Concrete as ResponseContentTypeAccessor } from '../src/ResponseContentTypeAccessor/index.mjs';

const Workflow = Implement.Workflow({
  normalizeHttpResponseBodyData: () => ({ stream: null, length: 0 }),
});

function createPlugins() {
  const workflow = new Workflow(Kit.global);
  let kit = null;

  workflow.mountPlugin(MimeTypePlugin);
  workflow.mountPlugin(CharsetPlugin);
  workflow.mountPlugin(
    Implement.Plugin({
      tag: 'probe',
      install: (PluginKit) => (kit = PluginKit),
    }),
  );

  return kit;
}

const KIT = createPlugins();

const TYPE_TABLE = useTypeTable(KIT);
const CHARSET = useCharset(KIT);

function createResponseType() {
  const headerMap = new Map();
  const exchange = {
    response: {
      header: {
        set: (key, value) => headerMap.set(key, value),
        get: (key) => headerMap.get(key),
      },
    },
  };

  return {
    responseType: new ResponseContentTypeAccessor(
      exchange,
      TYPE_TABLE,
      CHARSET,
    ),
    headerMap,
  };
}

describe('.set()', () => {
  it('should write a bare media type', () => {
    const { responseType, headerMap } = createResponseType();

    responseType.set('text/html');

    assert.equal(headerMap.get('content-type'), 'text/html');
  });

  it('should write the charset parameter', () => {
    const { responseType, headerMap } = createResponseType();

    responseType.set('text/html', 'utf-8');

    assert.equal(headerMap.get('content-type'), 'text/html; charset=utf-8');
  });

  it('should resolve an extension alias', () => {
    const { responseType, headerMap } = createResponseType();

    responseType.set('html');

    assert.equal(headerMap.get('content-type'), 'text/html');
  });

  it('should normalise the media type case', () => {
    const { responseType, headerMap } = createResponseType();

    responseType.set('TEXT/HTML');

    assert.equal(headerMap.get('content-type'), 'text/html');
  });

  it('should normalise the charset alias to the IANA name', () => {
    const { responseType, headerMap } = createResponseType();

    responseType.set('text/html', 'csUTF8');

    assert.equal(headerMap.get('content-type'), 'text/html; charset=utf-8');
  });

  it('should reject a media type outside the table', () => {
    const { responseType, headerMap } = createResponseType();

    assert.throws(() => responseType.set('application/vnd.unknown'));

    assert.equal(headerMap.has('content-type'), false);
  });

  it('should reject a charset outside the selector', () => {
    const { responseType, headerMap } = createResponseType();

    assert.throws(() => responseType.set('text/html', 'kitty-unknown'));

    assert.equal(headerMap.has('content-type'), false);
  });

  it('should reject a charset the media type does not accept', () => {
    const { responseType, headerMap } = createResponseType();

    assert.throws(() => responseType.set('image/png', 'utf-8'));

    assert.equal(headerMap.has('content-type'), false);
  });

  it('should reject an ambiguous alias', () => {
    const { responseType, headerMap } = createResponseType();

    assert.throws(() => responseType.set('json'), /answers 2 media types/);

    assert.equal(headerMap.has('content-type'), false);
  });

  it('should reject an empty media type', () => {
    const { responseType } = createResponseType();

    assert.throws(() => responseType.set(''));
  });

  it('should reject a media type containing whitespace', () => {
    const { responseType } = createResponseType();

    assert.throws(() => responseType.set('text / html'));
  });

  it('should reject an empty charset', () => {
    const { responseType } = createResponseType();

    assert.throws(() => responseType.set('text/html', ''));
  });

  it('should reject a non string media type', () => {
    const { responseType } = createResponseType();

    assert.throws(() => responseType.set(1));
  });
});
