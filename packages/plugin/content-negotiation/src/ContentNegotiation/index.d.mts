import type { useTypeTable } from '@produck/kitty-plugin-mime-type';
import type { Abstract as Workflow } from '@produck/kitty-workflow';

declare type TypeTable = ReturnType<typeof useTypeTable>;

declare class ContentNegotiation {
  constructor(exchange: Workflow.Exchange, typeTable: TypeTable);

  readonly accept: (...candidateList: string[]) => string | false;

  readonly acceptEncoding: (...candidateList: string[]) => string | false;

  readonly acceptCharset: (...candidateList: string[]) => string | false;

  readonly acceptLanguage: (...candidateList: string[]) => string | false;
}

export { ContentNegotiation as Concrete };
