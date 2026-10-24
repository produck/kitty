import { describe, it } from 'node:test';

describe('Deployer()', () => {
  describe('contract', () => {
    it('should require the name option');
    it('should require the server option');
    it('should require the http exchange option');
    it('should accept an absent web socket exchange option');
    it('should require the install option');
    it('should reject an unknown option');
  });

  describe('>class', () => {
    it('should derive from the deployer abstraction');
    it('should expose the name as both the static getter and the name slot');
    it('should expose the server constructor through the static slot');
    it('should expose both exchange constructors through the static slots');
  });

  describe('>install', () => {
    it('should call the supplied install option with the deployer kit');
  });
});
