import { describe, it } from 'node:test';

describe('Plugin', () => {
  describe('::name', () => {
    it('should read the name slot');
  });

  describe('.attachWorkflow()', () => {
    it('should attach a value to the workflow kit');
    it('should reject a non-string dependence name');
    it('should reject after the workflow finalizes');
  });

  describe('.appendDeploymentAttacher()', () => {
    it('should register a deployment attacher');
    it('should reject a non-function attacher');
  });

  describe('.appendExchangeAttacher()', () => {
    it('should register an exchange attacher');
    it('should reject a non-function attacher');
  });

  describe('.appendPrefixHandler()', () => {
    it('should register prefix handlers');
    it('should reject a non-function handler');
    it('should reject after the workflow finalizes');
  });
});
