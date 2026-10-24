import { describe, it } from 'node:test';

describe('Plugin()', () => {
  describe('contract', () => {
    it('should require the name option');
    it('should require the install option');
    it('should reject an unknown option');
  });

  describe('>class', () => {
    it('should derive from the plugin abstraction');
    it('should expose the name as both the static getter and the name slot');
  });

  describe('>install', () => {
    it('should call the supplied install option with the plugin kit');
  });
});
