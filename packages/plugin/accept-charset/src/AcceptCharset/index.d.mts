import type { useCharset } from '@produck/kitty-plugin-charset';
import type { Abstract as Workflow } from '@produck/kitty-workflow';

declare type Charset = ReturnType<typeof useCharset>;

declare class AcceptCharset {
  constructor(exchange: Workflow.Exchange, charset: Charset);

  readonly acceptCharset: (...candidateList: string[]) => string | false;
}

export { AcceptCharset as Concrete };
