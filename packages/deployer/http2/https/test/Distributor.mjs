import { SubConstructorProxy as SCP } from '@produck/es-abstract';
import * as Fugue from '@produck/fugue';

class DegradedChunkReader extends Fugue.DegradedChunkReader {}

export default SCP(
  class Distributor extends Fugue.Distributor {
    static get [Fugue.SYMBOL.DISTRIBUTOR._S.DEGRADED_CHUNK_READER_CTOR]() {
      return DegradedChunkReader;
    }
  },
);
