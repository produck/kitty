import { describe, it } from 'node:test';

describe('WebSocketResponse', () => {
  describe('.isFinished', () => {
    it('should always report a finished response');
  });

  describe('.statusCode', () => {
    it('should read the handshake status');
  });

  describe('.header', () => {
    it('should expose the handshake header part');
  });
});
