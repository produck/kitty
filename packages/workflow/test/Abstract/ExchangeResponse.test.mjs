import { describe, it } from 'node:test';

describe('ExchangeResponse', () => {
  describe('.statusCode', () => {
    it('should read the status from the internal record');
  });

  describe('.statusText', () => {
    it('should read the status text from the internal record');
  });

  describe('.isFinished', () => {
    it('should read the finished state from the internal record');
  });

  describe('.header', () => {
    it('should expose the read-only header part');
  });

  describe('>read-only surface', () => {
    it('should not expose a status setter');
    it('should not expose a header mutator');
  });
});
