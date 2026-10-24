import { describe, it } from 'node:test';

describe('ExchangeMutableResponse', () => {
  describe('.setStatus()', () => {
    it('should write the status through the internal record');
    it('should write the status text through the internal record');
    it('should keep the status text when it is omitted');
    it('should reject a status outside the http status range');
  });

  describe('.header', () => {
    it('should expose the mutable header part');
  });
});
