import type { useTypeTable } from '@produck/kitty-plugin-mime-type';
import type { useCharset } from '@produck/kitty-plugin-charset';
import type { Abstract as Workflow } from '@produck/kitty-workflow';

declare type TypeTable = ReturnType<typeof useTypeTable>;
declare type Charset = ReturnType<typeof useCharset>;

declare class ResponseContentTypeAccessor {
  constructor(
    exchange: Workflow.MutableResponse,
    typeTable: TypeTable,
    charset: Charset,
  );

  /**
   * Writes `Content-Type`, asserting the media type and the charset first.
   *
   * The media type has to be registered in the workflow mime type table; a
   * bare extension alias resolves through the alias index. When a charset is
   * given it has to be registered in the charset selector and be listed by
   * the media type record.
   *
   * @param mediaType - Media type or a registered extension alias.
   * @param charsetName - Optional charset name or alias.
   */
  set(mediaType: string, charsetName?: string): void;
}

export { ResponseContentTypeAccessor as Concrete };
