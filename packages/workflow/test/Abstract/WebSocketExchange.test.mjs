import { describe, it } from 'node:test';

describe('WebSocketExchange', () => {
  describe('.response', () => {
    it('should expose the web socket response part');
  });

  describe('.request', () => {
    it('should expose the handshake request part');
  });

  describe('>controller', () => {
    it('should attach the controller to the exchange kit');
    it(
      'should let a handler read the controller through the capability accessor',
    );
  });
});
