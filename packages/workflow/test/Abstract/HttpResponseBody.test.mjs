import { describe, it } from 'node:test';

describe('HttpResponseBody', () => {
  describe('.data', () => {
    it('should expose the normalized body data');
    it('should reject a value outside the normalizer result');
  });
});
