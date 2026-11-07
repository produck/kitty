import type { useTypeTable } from '@produck/kitty-plugin-mime-type';
import type { Abstract as Workflow } from '@produck/kitty-workflow';

declare type TypeTable = ReturnType<typeof useTypeTable>;

declare class ContentNegotiation {
  constructor(exchange: Workflow.Exchange, typeTable: TypeTable);

  accept(...candidateList: string[]): string | false;

  acceptEncoding(...candidateList: string[]): string | false;

  acceptCharset(...candidateList: string[]): string | false;

  acceptLanguage(...candidateList: string[]): string | false;
}

export { ContentNegotiation as Concrete };
