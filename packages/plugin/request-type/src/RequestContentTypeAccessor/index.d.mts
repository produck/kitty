import type { useTypeTable } from '@produck/kitty-plugin-mime-type';
import type { Abstract as Workflow } from '@produck/kitty-workflow';

declare type TypeTable = ReturnType<typeof useTypeTable>;

declare class RequestContentTypeAccessor {
  constructor(exchange: Workflow.Exchange, typeTable: TypeTable);

  is(...patternList: string[]): string | false;
}

export { RequestContentTypeAccessor as Concrete };
