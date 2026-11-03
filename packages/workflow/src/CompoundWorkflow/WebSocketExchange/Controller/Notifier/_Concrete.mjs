import * as Event from '../Event.mjs';
import { I } from './_Symbol.mjs';

export default class Notifier {
  [I.LISTENER] = null;

  constructor(controller) {
    this[I.LISTENER] = Object.freeze({
      message: (data, isBinary) => {
        controller.dispatchEvent(new Event.Message(data, isBinary));
      },
      close: (code, reason) => {
        controller.dispatchEvent(new Event.Close(code, reason));
      },
      error: (error) => {
        controller.dispatchEvent(new Event.Error(error));
      },
    });
  }

  get message() {
    return this[I.LISTENER].message;
  }

  get close() {
    return this[I.LISTENER].close;
  }

  get error() {
    return this[I.LISTENER].error;
  }
}
