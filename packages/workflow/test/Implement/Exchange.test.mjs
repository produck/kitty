import { describe, it } from 'node:test';

describe('Http()', () => {
  describe('contract', () => {
    it('should require the identity option');
    it('should require the server option');
    it('should require the http version option');
    it('should require the request option');
    it('should require the response option');
    it('should reject an unknown option');
  });

  describe('>class', () => {
    it('should derive from the http exchange abstraction');
    it('should declare the request and response constructor slots');
  });

  describe('>normalizer', () => {
    it('should drive a read-only response through the read-only surface');
    it('should drive a mutable response through the setter surface');
    it('should reject a mutable response without setters');
  });
});

describe('WebSocket()', () => {
  describe('contract', () => {
    it('should require the controller option');
    it('should accept the handshake request and response options');
    it('should reject an unknown option');
  });

  describe('>class', () => {
    it('should derive from the web socket exchange abstraction');
    it('should declare the controller constructor slot');
  });

  describe('>normalizer', () => {
    it('should reject a controller without the send accessor');
    it('should reject a controller without the close accessor');
  });
});
