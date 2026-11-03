import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Baseline from '../Baseline/index.mjs';

const KittyEvent = Baseline.Kitty.WebSocketControllerEvent;

describe('WebSocketControllerEvent', () => {
  describe('::TYPE', () => {
    it('should expose the event type names', () => {
      assert.deepEqual(
        { ...KittyEvent.TYPE },
        {
          OPEN: 'open',
          MESSAGE: 'message',
          CLOSE: 'close',
          ERROR: 'error',
        },
      );
      assert.ok(Object.isFrozen(KittyEvent.TYPE));
    });
  });

  describe('::READY_STATE', () => {
    it('should expose the ready state values', () => {
      assert.deepEqual(
        { ...KittyEvent.READY_STATE },
        {
          CONNECTING: 0,
          OPEN: 1,
          CLOSING: 2,
          CLOSED: 3,
        },
      );
      assert.ok(Object.isFrozen(KittyEvent.READY_STATE));
    });
  });

  describe('::Message', () => {
    it('should carry the payload and the binary flag', () => {
      const data = new Uint8Array([1, 2]);
      const event = new KittyEvent.Message(data, true);

      assert.ok(event instanceof globalThis.Event);
      assert.equal(event.type, KittyEvent.TYPE.MESSAGE);
      assert.equal(event.data, data);
      assert.equal(event.isBinary, true);
    });
  });

  describe('::Close', () => {
    it('should carry the close code and reason', () => {
      const event = new KittyEvent.Close(1000, 'done');

      assert.ok(event instanceof globalThis.Event);
      assert.equal(event.type, KittyEvent.TYPE.CLOSE);
      assert.equal(event.code, 1000);
      assert.equal(event.reason, 'done');
    });
  });

  describe('::Error', () => {
    it('should carry the failure', () => {
      const error = new RangeError('probe');
      const event = new KittyEvent.Error(error);

      assert.ok(event instanceof globalThis.Event);
      assert.equal(event.type, KittyEvent.TYPE.ERROR);
      assert.equal(event.error, error);
    });
  });
});
