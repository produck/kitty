import Abstract from '@produck/es-abstract';
import { I as _I } from './Symbol.mjs';

export default Abstract(
  class KittyTransaction {
    get URL() {
      return undefined;
    }

    get finished() {
      return undefined;
    }

    get method() {
      return undefined;
    }

    get status() {
      return undefined;
    }
  },
);
