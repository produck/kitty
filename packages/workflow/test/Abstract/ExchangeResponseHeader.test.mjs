import { describe, it } from 'node:test';

describe('ExchangeResponseHeader', () => {
  describe('.get()', () => {
    it('should return the value of a present name');
    it('should return undefined for an absent name');
    it('should read the name case-insensitively');
  });

  describe('.keys()', () => {
    it('should return every present name');
  });
});
