import { describe, it } from 'node:test';

describe('HttpRequestBody', () => {
  describe('.data', () => {
    it('should fork a reader from the distributor');
    it('should give every reader an independent progress');
  });

  describe('.distributor', () => {
    it('should expose the distributor of the exchange');
  });

  describe('#data', () => {
    it('should forward every chunk to the reader');
  });

  describe('#end', () => {
    it('should dispatch when the source ends');
  });

  describe('#close', () => {
    it('should dispatch when the source closes');
  });

  describe('#error', () => {
    it('should dispatch with the source error');
  });

  describe('#limit', () => {
    it('should dispatch when the size limit is consumed');
  });

  describe('>limit', () => {
    it('should destroy the distributor');
    it('should set the status to 413');
  });
});
