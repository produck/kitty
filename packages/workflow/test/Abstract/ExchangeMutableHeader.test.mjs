import { describe, it } from 'node:test';

describe('ExchangeMutableHeader', () => {
  describe('.set()', () => {
    it('should write a name and value');
    it('should overwrite a present name');
    it('should reject a non-string value');
  });

  describe('.delete()', () => {
    it('should remove a present name');
    it('should ignore an absent name');
  });

  describe('.clear()', () => {
    it('should remove every name');
  });

  describe('>case', () => {
    it('should treat the names case-insensitively');
  });
});
