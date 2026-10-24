import { describe, it } from 'node:test';

describe('Exchange', () => {
  describe('.method', () => {
    it('should forward the request method');
  });

  describe('.url', () => {
    it('should forward the request url');
  });

  describe('.statusCode', () => {
    it('should forward the response status code');
  });

  describe('.statusText', () => {
    it('should forward the response status text');
  });

  describe('.setStatus()', () => {
    it('should forward the status to the response');
  });

  describe('.request', () => {
    it('should expose the request part');
  });

  describe('.response', () => {
    it('should expose the response part');
  });

  describe('.workflow', () => {
    it('should expose the workflow of the deployment');
  });

  describe('.server', () => {
    it('should read the server from the internal record');
  });

  describe('.protocol', () => {
    it('should read the server protocol from the internal record');
  });

  describe('.mode', () => {
    it('should read the exchange mode from the internal record');
  });

  describe('.httpVersion', () => {
    it('should read the http version from the internal record');
  });

  describe('.toJSON()', () => {
    it('should reject serialization');
  });

  describe('>dispatch', () => {
    it('should reject a repeated identity');
    it('should accept distinct identities');
  });

  describe('#done', () => {
    it('should dispatch after the pipeline resolves');
  });

  describe('#error', () => {
    it('should dispatch with the pipeline error');
  });

  describe('#finish', () => {
    it('should dispatch once after done or error');
    it('should dispatch even when the pipeline throws');
  });
});
