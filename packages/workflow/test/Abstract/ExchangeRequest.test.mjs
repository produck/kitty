import { describe, it } from 'node:test';

describe('ExchangeRequest', () => {
  describe('.method', () => {
    it('should read the method from the internal record');
    it('should reject a value outside the http method list');
  });

  describe('.url', () => {
    it('should read the url from the internal record');
  });

  describe('.header', () => {
    it('should expose the header part');
  });
});
