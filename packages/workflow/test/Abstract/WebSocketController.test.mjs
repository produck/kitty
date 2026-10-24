import { describe, it } from 'node:test';

describe('WebSocketController', () => {
  describe('.readyState', () => {
    it('should read the ready state of the socket');
  });

  describe('.send()', () => {
    it('should write a payload to the socket');
    it('should reject a payload outside the allowed types');
  });

  describe('.close()', () => {
    it('should close the socket with a code and a reason');
  });

  describe('#close', () => {
    it('should dispatch when the socket closes');
  });

  describe('#error', () => {
    it('should dispatch with the socket error');
  });
});
