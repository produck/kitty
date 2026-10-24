import { describe, it } from 'node:test';

describe('Workflow()', () => {
  describe('contract', () => {
    it('should require the normalize option');
    it('should reject an unknown option');
  });

  describe('>instance', () => {
    it('should derive from the workflow abstraction');
    it('should expose the abstract surface only');
  });

  describe('>normalize', () => {
    it('should delegate every call to the supplied option');
  });
});
