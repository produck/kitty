# @produck/kitty-charset

Charset registry with indexing and queries, built on
[`@produck/meta-iana-charset`][meta].

Not a plugin: it never touches a workflow and has no side effect.

[meta]: https://www.npmjs.com/package/@produck/meta-iana-charset

## Usage

```js
import {
  ANY,
  COUNT,
  find,
  findByMibEnum,
  findByName,
  findPreferredName,
  isCharset,
  isMibEnum,
  toMibEnum,
} from '@produck/kitty-charset';

isCharset('latin1'); // true，大小写不敏感
isCharset(106); // true，MIBenum 也认
toMibEnum('latin1'); // 4
findPreferredName('latin1'); // 'ISO-8859-1'
findByName('latin1'); // → 记录
findByMibEnum(106); // → 记录
ANY; // 全部 MIBenum，升序
```

## Record shape

```ts
interface Record {
  name: string; // IANA 注册名
  mibEnum: number; // 唯一 MIBenum
  preferredName: string; // IANA 首选名，缺省回退到 name
  aliasList: string[]; // 全部可用写法，含 name
}
```

`find*` 系列都返回**深拷贝**，改返回值不影响内部数据。

## Notes

- 别名索引小写化，查询大小写不敏感并自动 trim。
- 本包只提供注册表事实，不判断某媒体类型是否允许 `charset` 参数。
- 支持自定义（非 IANA）字符集不在本包范围内；需要时由 plugin 层承担。

## License

MIT
