import * as P from './_Parser.mjs';
import { I } from './_Symbol.mjs';

export default class CookieParser {
  [I.ENTRY_MAP] = new Map();

  constructor(records) {
    for (const record of P.CookieRecords(records)) {
      if (!this[I.ENTRY_MAP].has(record.name)) {
        this[I.ENTRY_MAP].set(record.name, record);
      }
    }
  }

  get size() {
    return this[I.ENTRY_MAP].size;
  }

  has(name) {
    return this[I.ENTRY_MAP].has(P.CookieName(name));
  }

  get(name) {
    return this[I.ENTRY_MAP].get(P.CookieName(name));
  }

  keys() {
    return this[I.ENTRY_MAP].keys();
  }

  values() {
    return this[I.ENTRY_MAP].values();
  }

  entries() {
    return this[I.ENTRY_MAP].entries();
  }

  [Symbol.iterator]() {
    return this.values();
  }
}
