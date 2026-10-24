import { describe, it } from 'node:test';

describe('Deployer', () => {
  describe('::name', () => {
    it('should read the name slot');
  });

  describe('.declare()', () => {
    it('should write a named entry into the manifest');
    it('should reject a non-string name');
  });

  describe('.setServerLinker()', () => {
    it('should register a linker for the link phase');
    it('should reject a non-function linker');
  });

  describe('.appendExchangeAttacher()', () => {
    it('should register an attacher for every exchange');
    it('should reject a non-function attacher');
  });

  describe('.attachDeployment()', () => {
    it('should attach a value to the deployment kit');
    it('should reject a non-string key');
  });

  describe('.handleHttpExchange()', () => {
    it('should dispatch the http exchange class with the internal record');
  });

  describe('.handleWebSocketExchange()', () => {
    it('should dispatch the web socket exchange class');
    it('should reject when the web socket slot is absent');
  });

  describe('>commit gate', () => {
    it('should reject every port after the deployment commits');
  });
});
