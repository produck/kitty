import { describe, it } from 'node:test';

describe('HttpExchange', () => {
  describe('.request', () => {
    it('should expose the http request part');
  });

  describe('.response', () => {
    it('should expose the http response part');
  });

  describe('#timeout', () => {
    it('should dispatch when the response outlives the timeout option');
    it('should stop the timer when the pipeline finishes');
  });

  describe('>status', () => {
    it('should set the status to 503 before dispatching the timeout');
  });
});
