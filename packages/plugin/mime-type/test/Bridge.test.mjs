import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Kit from '@produck/kit';
import { Implement } from '@produck/kitty-workflow';

import {
  deleteItem,
  findAll,
  registerItem,
  registerItems,
} from '../src/index.mjs';
import * as Bridge from '../src/Bridge.mjs';

const findByAlias = (workflow, alias) =>
  Bridge.getTypeTable(workflow).findByAlias(alias);
const findByMimeType = (workflow, mimeType) =>
  Bridge.getTypeTable(workflow).findByMimeType(mimeType);

function createRawWorkflow() {
  const Workflow = Implement.Workflow({
    normalizeHttpResponseBodyData: () => ({ stream: null, length: 0 }),
  });

  return new Workflow(Kit.global);
}

function createWorkflow() {
  const workflow = createRawWorkflow();

  Bridge.installTypeTable(workflow);

  return workflow;
}

describe('::installTypeTable()', () => {
  it('should answer the new table', () => {
    const workflow = createRawWorkflow();
    const typeTable = Bridge.installTypeTable(workflow);

    assert.equal(Bridge.getTypeTable(workflow), typeTable);
  });
});

describe('::getTypeTable()', () => {
  it('should reject a workflow without an installed table', () => {
    assert.throws(() => Bridge.getTypeTable(createRawWorkflow()));
  });

  it('should answer the installed table', () => {
    const workflow = createRawWorkflow();
    const typeTable = Bridge.installTypeTable(workflow);

    assert.equal(Bridge.getTypeTable(workflow), typeTable);
  });
});

describe('::registerItem()', () => {
  it('should reject a value that is not a workflow', () => {
    assert.throws(() =>
      registerItem({}, { alias: 'a', mimeType: 'a/b', charsetList: [] }),
    );
  });

  it('should answer the normalized item', () => {
    const workflow = createWorkflow();

    assert.deepEqual(
      registerItem(workflow, {
        alias: 'JSON',
        mimeType: 'Application/JSON',
        charsetList: [],
      }),
      { alias: 'json', mimeType: 'application/json', charsetList: [] },
    );
  });

  it('should reject a charset list outside the contract', () => {
    const charsetListList = [
      undefined,
      1,
      'utf-8',
      ['utf-8'],
      [0],
      [-1],
      [1.5],
    ];

    for (const charsetList of charsetListList) {
      assert.throws(
        () =>
          registerItem(createWorkflow(), {
            alias: 'a',
            mimeType: 'a/b',
            charsetList,
          }),
        { message: /charsetList/ },
      );
    }
  });

  it('should dedupe the charset list', () => {
    const workflow = createWorkflow();

    assert.deepEqual(
      registerItem(workflow, {
        alias: 'a',
        mimeType: 'a/b',
        charsetList: [106, 4, 106],
      }).charsetList,
      [106, 4],
    );
  });

  it('should answer a charset list copy', () => {
    const workflow = createWorkflow();
    const item = registerItem(workflow, {
      alias: 'a',
      mimeType: 'a/b',
      charsetList: [106],
    });

    item.charsetList.push(4);

    assert.deepEqual(findAll(workflow)[0].charsetList, [106]);
  });

  it('should reject a value that is not an item record', () => {
    for (const value of ['x', null, [], 1]) {
      assert.throws(() => registerItem(createWorkflow(), value));
    }
  });

  it('should reject an alias outside the contract', () => {
    for (const alias of [undefined, 1, '', 'a b']) {
      assert.throws(() => registerItem(createWorkflow(), { alias }));
    }
  });

  it('should reject a mime type outside the contract', () => {
    const mimeTypeList = [
      undefined,
      1,
      '',
      'plain',
      '/plain',
      'text/',
      'a b/c',
      'text/plain; charset=utf-8',
    ];

    for (const mimeType of mimeTypeList) {
      assert.throws(() =>
        registerItem(createWorkflow(), { alias: 'a', mimeType }),
      );
    }
  });

  it('should reject one alias and mime type pair twice', () => {
    const workflow = createWorkflow();

    registerItem(workflow, {
      alias: 'json',
      mimeType: 'application/json',
      charsetList: [],
    });

    assert.throws(() =>
      registerItem(workflow, {
        alias: 'json',
        mimeType: 'application/json',
        charsetList: [],
      }),
    );
  });

  it('should accept one alias of two mime types', () => {
    const workflow = createWorkflow();

    registerItem(workflow, {
      alias: 'xml',
      mimeType: 'application/xml',
      charsetList: [],
    });
    registerItem(workflow, {
      alias: 'xml',
      mimeType: 'text/xml',
      charsetList: [],
    });

    assert.equal(findByAlias(workflow, 'xml').length, 2);
  });
});

describe('::registerItems()', () => {
  it('should register every item', () => {
    const workflow = createWorkflow();

    registerItems(workflow, [
      { alias: 'json', mimeType: 'application/json', charsetList: [] },
      { alias: 'text', mimeType: 'text/plain', charsetList: [] },
    ]);

    assert.equal(findAll(workflow).length, 2);
  });

  it('should reject a value that is not a workflow', () => {
    assert.throws(() => registerItems({}, []));
  });
});

describe('::deleteItem()', () => {
  it('should drop the item from both indexes', () => {
    const workflow = createWorkflow();

    registerItem(workflow, {
      alias: 'json',
      mimeType: 'application/json',
      charsetList: [],
    });
    deleteItem(workflow, {
      alias: 'json',
      mimeType: 'application/json',
      charsetList: [],
    });

    assert.deepEqual(findByAlias(workflow, 'json'), []);
    assert.deepEqual(findByMimeType(workflow, 'application/json'), []);
    assert.deepEqual(findAll(workflow), []);
  });

  it('should keep the alias while another mime type holds it', () => {
    const workflow = createWorkflow();

    registerItem(workflow, {
      alias: 'xml',
      mimeType: 'application/xml',
      charsetList: [],
    });
    registerItem(workflow, {
      alias: 'xml',
      mimeType: 'text/xml',
      charsetList: [],
    });
    deleteItem(workflow, {
      alias: 'xml',
      mimeType: 'application/xml',
      charsetList: [],
    });

    assert.deepEqual(findByAlias(workflow, 'xml'), [
      { alias: 'xml', mimeType: 'text/xml', charsetList: [] },
    ]);
  });

  it('should reject an absent item', () => {
    const workflow = createWorkflow();

    assert.throws(() =>
      deleteItem(workflow, {
        alias: 'json',
        mimeType: 'application/json',
        charsetList: [],
      }),
    );
  });

  it('should reject a value that is not a workflow', () => {
    assert.throws(() =>
      deleteItem({}, { alias: 'a', mimeType: 'a/b', charsetList: [] }),
    );
  });
});

describe('.findByAlias()', () => {
  it('should answer every item of the alias', () => {
    const workflow = createWorkflow();

    registerItem(workflow, {
      alias: 'jpeg',
      mimeType: 'image/jpeg',
      charsetList: [],
    });
    registerItem(workflow, {
      alias: 'jpg',
      mimeType: 'image/jpeg',
      charsetList: [],
    });

    assert.deepEqual(findByAlias(workflow, 'jpg'), [
      { alias: 'jpg', mimeType: 'image/jpeg', charsetList: [] },
    ]);
  });

  it('should read the alias case-insensitively', () => {
    const workflow = createWorkflow();

    registerItem(workflow, {
      alias: 'json',
      mimeType: 'application/json',
      charsetList: [],
    });

    assert.equal(findByAlias(workflow, 'JSON').length, 1);
  });

  it('should answer an empty list for an unknown alias', () => {
    assert.deepEqual(findByAlias(createWorkflow(), 'json'), []);
  });

  it('should reject an alias outside the contract', () => {
    assert.throws(() => findByAlias(createWorkflow(), 1));
  });
});

describe('.findByMimeType()', () => {
  it('should answer every alias of the mime type', () => {
    const workflow = createWorkflow();

    registerItem(workflow, {
      alias: 'jpeg',
      mimeType: 'image/jpeg',
      charsetList: [],
    });
    registerItem(workflow, {
      alias: 'jpg',
      mimeType: 'image/jpeg',
      charsetList: [],
    });

    assert.deepEqual(findByMimeType(workflow, 'image/jpeg'), [
      { alias: 'jpeg', mimeType: 'image/jpeg', charsetList: [] },
      { alias: 'jpg', mimeType: 'image/jpeg', charsetList: [] },
    ]);
  });

  it('should read the mime type case-insensitively', () => {
    const workflow = createWorkflow();

    registerItem(workflow, {
      alias: 'json',
      mimeType: 'application/json',
      charsetList: [],
    });

    assert.equal(findByMimeType(workflow, 'Application/JSON').length, 1);
  });

  it('should answer an empty list for an unknown mime type', () => {
    assert.deepEqual(findByMimeType(createWorkflow(), 'application/json'), []);
  });

  it('should reject a mime type outside the contract', () => {
    for (const mimeType of [1, '', 'plain', 'a/b c']) {
      assert.throws(() => findByMimeType(createWorkflow(), mimeType));
    }
  });
});

describe('::findAll()', () => {
  it('should answer one list per workflow', () => {
    const left = createWorkflow();
    const right = createWorkflow();

    registerItem(left, {
      alias: 'json',
      mimeType: 'application/json',
      charsetList: [],
    });

    assert.equal(findAll(left).length, 1);
    assert.deepEqual(findAll(right), []);
  });

  it('should answer a copy of the item list', () => {
    const workflow = createWorkflow();

    registerItem(workflow, {
      alias: 'json',
      mimeType: 'application/json',
      charsetList: [],
    });
    findAll(workflow).push({ alias: 'x', mimeType: 'x/x', charsetList: [] });

    assert.equal(findAll(workflow).length, 1);
  });

  it('should reject a value that is not a workflow', () => {
    assert.throws(() => findAll({}));
  });
});
