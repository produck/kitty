import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Kit from '@produck/kit';
import { Implement } from '@produck/kitty-workflow';

import * as Bridge from '../src/Bridge.mjs';
import {
  deleteItem,
  findAll,
  registerItem,
  registerItems,
} from '../src/index.mjs';

function createWorkflow() {
  const Workflow = Implement.Workflow({
    normalizeHttpResponseBodyData: () => ({ stream: null, length: 0 }),
  });

  return new Workflow(Kit.global);
}

function createTypeTable() {
  const workflow = createWorkflow();

  return { workflow, typeTable: Bridge.installTypeTable(workflow) };
}

const JSON_ITEM = {
  mimeType: 'application/json',
  aliasList: ['json'],
  charsetList: [],
};

const XML_ITEM = {
  mimeType: 'application/xml',
  aliasList: ['xml'],
  charsetList: [],
};

const TEXT_XML_ITEM = {
  mimeType: 'text/xml',
  aliasList: ['xml'],
  charsetList: [],
};

describe('::installTypeTable()', () => {
  it('should answer one table per workflow', () => {
    const left = createTypeTable().workflow;
    const right = createTypeTable().workflow;

    assert.notEqual(
      Bridge.installTypeTable(left),
      Bridge.installTypeTable(right),
    );
  });
});

describe('::getTypeTable()', () => {
  it('should reject a workflow without a table', () => {
    assert.throws(() => Bridge.getTypeTable(createWorkflow()));
  });

  it('should answer the installed table', () => {
    const { workflow, typeTable } = createTypeTable();

    assert.equal(Bridge.getTypeTable(workflow), typeTable);
  });
});

describe('::registerItem()', () => {
  it('should reject a value that is not a workflow', () => {
    assert.throws(() => registerItem({}, JSON_ITEM));
  });

  it('should answer the normalized item', () => {
    const { workflow } = createTypeTable();

    assert.deepEqual(
      registerItem(workflow, {
        mimeType: 'Application/JSON',
        aliasList: ['JSON'],
        charsetList: [],
      }),
      { mimeType: 'application/json', aliasList: ['json'], charsetList: [] },
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
          registerItem(createTypeTable().workflow, {
            mimeType: 'a/b',
            aliasList: ['a'],
            charsetList,
          }),
        { message: /charsetList/ },
      );
    }
  });

  it('should dedupe the charset list', () => {
    const { workflow } = createTypeTable();

    assert.deepEqual(
      registerItem(workflow, {
        mimeType: 'a/b',
        aliasList: ['a'],
        charsetList: [106, 4, 106],
      }).charsetList,
      [106, 4],
    );
  });

  it('should answer a charset list copy', () => {
    const { workflow } = createTypeTable();
    const item = registerItem(workflow, {
      mimeType: 'a/b',
      aliasList: ['a'],
      charsetList: [106],
    });

    item.charsetList.push(4);

    assert.deepEqual(findAll(workflow)[0].charsetList, [106]);
  });

  it('should reject a value that is not an item record', () => {
    for (const value of ['x', null, [], 1]) {
      assert.throws(() => registerItem(createTypeTable().workflow, value));
    }
  });

  it('should accept an empty alias list', () => {
    const { workflow } = createTypeTable();

    assert.deepEqual(
      registerItem(workflow, {
        mimeType: 'unknown/unknown',
        aliasList: [],
        charsetList: [],
      }).aliasList,
      [],
    );
  });

  it('should reject an alias list outside the contract', () => {
    const aliasListList = [
      undefined,
      1,
      'json',
      {},
      [undefined],
      [1],
      [''],
      ['a b'],
    ];

    for (const aliasList of aliasListList) {
      assert.throws(
        () =>
          registerItem(createTypeTable().workflow, {
            mimeType: 'a/b',
            aliasList,
          }),
        { message: /aliasList/ },
      );
    }
  });

  it('should normalize and dedupe the alias list', () => {
    const { workflow } = createTypeTable();

    assert.deepEqual(
      registerItem(workflow, {
        mimeType: 'image/jpeg',
        aliasList: ['JPEG', 'jpg', 'jpeg'],
        charsetList: [],
      }).aliasList,
      ['jpeg', 'jpg'],
    );
  });

  it('should answer an alias list copy', () => {
    const { workflow } = createTypeTable();
    const item = registerItem(workflow, {
      mimeType: 'image/jpeg',
      aliasList: ['jpeg'],
      charsetList: [],
    });

    item.aliasList.push('jpg');

    assert.deepEqual(findAll(workflow)[0].aliasList, ['jpeg']);
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
        registerItem(createTypeTable().workflow, {
          mimeType,
          aliasList: ['a'],
        }),
      );
    }
  });

  it('should reject one mime type twice', () => {
    const { workflow } = createTypeTable();

    registerItem(workflow, JSON_ITEM);

    assert.throws(() =>
      registerItem(workflow, { ...JSON_ITEM, aliasList: ['other'] }),
    );
  });

  it('should accept one alias of two mime types', () => {
    const { workflow } = createTypeTable();

    registerItem(workflow, XML_ITEM);
    registerItem(workflow, TEXT_XML_ITEM);

    assert.equal(findAll(workflow).length, 2);
  });
});

describe('::registerItems()', () => {
  it('should register every item', () => {
    const { workflow } = createTypeTable();

    registerItems(workflow, [
      JSON_ITEM,
      { mimeType: 'text/plain', aliasList: ['text'], charsetList: [] },
    ]);

    assert.equal(findAll(workflow).length, 2);
  });

  it('should reject a value that is not a workflow', () => {
    assert.throws(() => registerItems({}, []));
  });
});

describe('::deleteItem()', () => {
  it('should drop the item from both indexes', () => {
    const { workflow, typeTable } = createTypeTable();

    registerItem(workflow, JSON_ITEM);
    deleteItem(workflow, JSON_ITEM);

    assert.deepEqual(findAll(workflow), []);
    assert.deepEqual(typeTable.findByAlias('json'), []);
    assert.deepEqual(typeTable.findByMimeType('application/json'), []);
  });

  it('should keep the alias while another mime type holds it', () => {
    const { workflow, typeTable } = createTypeTable();

    registerItem(workflow, XML_ITEM);
    registerItem(workflow, TEXT_XML_ITEM);
    deleteItem(workflow, XML_ITEM);

    assert.deepEqual(typeTable.findByAlias('xml'), [
      { mimeType: 'text/xml', aliasList: ['xml'], charsetList: [] },
    ]);
  });

  it('should reject an absent item', () => {
    const { workflow } = createTypeTable();

    assert.throws(() => deleteItem(workflow, JSON_ITEM));
  });

  it('should reject a value that is not a workflow', () => {
    assert.throws(() => deleteItem({}, JSON_ITEM));
  });
});

describe('.findByAlias()', () => {
  it('should answer every item holding the alias', () => {
    const { workflow, typeTable } = createTypeTable();

    registerItem(workflow, {
      mimeType: 'image/jpeg',
      aliasList: ['jpeg', 'jpg'],
      charsetList: [],
    });

    assert.deepEqual(typeTable.findByAlias('jpg'), [
      {
        mimeType: 'image/jpeg',
        aliasList: ['jpeg', 'jpg'],
        charsetList: [],
      },
    ]);
  });

  it('should read the alias case-insensitively', () => {
    const { workflow, typeTable } = createTypeTable();

    registerItem(workflow, JSON_ITEM);

    assert.equal(typeTable.findByAlias('JSON').length, 1);
  });

  it('should answer an empty list for an unknown alias', () => {
    const { typeTable } = createTypeTable();

    assert.deepEqual(typeTable.findByAlias('json'), []);
  });

  it('should reject an alias outside the contract', () => {
    const { typeTable } = createTypeTable();

    assert.throws(() => typeTable.findByAlias(1));
  });
});

describe('.findByMimeType()', () => {
  it('should answer the item of the mime type', () => {
    const { workflow, typeTable } = createTypeTable();

    registerItem(workflow, {
      mimeType: 'image/jpeg',
      aliasList: ['jpeg', 'jpg'],
      charsetList: [],
    });

    assert.deepEqual(typeTable.findByMimeType('image/jpeg'), [
      {
        mimeType: 'image/jpeg',
        aliasList: ['jpeg', 'jpg'],
        charsetList: [],
      },
    ]);
  });

  it('should read the mime type case-insensitively', () => {
    const { workflow, typeTable } = createTypeTable();

    registerItem(workflow, JSON_ITEM);

    assert.equal(typeTable.findByMimeType('Application/JSON').length, 1);
  });

  it('should answer an empty list for an unknown mime type', () => {
    const { typeTable } = createTypeTable();

    assert.deepEqual(typeTable.findByMimeType('application/json'), []);
  });

  it('should reject a mime type outside the contract', () => {
    const { typeTable } = createTypeTable();

    for (const mimeType of [1, '', 'plain', 'a/b c']) {
      assert.throws(() => typeTable.findByMimeType(mimeType));
    }
  });
});

describe('::findAll()', () => {
  it('should answer one list per workflow', () => {
    const left = createTypeTable().workflow;
    const right = createTypeTable().workflow;

    registerItem(left, JSON_ITEM);

    assert.equal(findAll(left).length, 1);
    assert.deepEqual(findAll(right), []);
  });

  it('should answer a copy of the item list', () => {
    const { workflow } = createTypeTable();

    registerItem(workflow, JSON_ITEM);
    findAll(workflow).push({
      mimeType: 'x/x',
      aliasList: ['x'],
      charsetList: [],
    });

    assert.equal(findAll(workflow).length, 1);
  });

  it('should reject a value that is not a workflow', () => {
    assert.throws(() => findAll({}));
  });
});
