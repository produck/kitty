# DEV

## 文档分工

- `DEV.md`：为什么这样写。只记**当前生效的决策**与其代价；被推翻的写法
  直接删除。
- 本包暂时没有 `DESIGN.md`，形状以源码与 `.d.mts` 为准。
- 源码注释只留 `TODO` 与契约性说明。

## 与下游的边界

### 决定

1. 本包只做 cookie 头的语法层：来向解析、去向校验与序列化。
2. 签名、加密、JSON 编解码、secret 注入与轮换，属于本包的下游
   （另一个插件或应用自身）。
3. 本包不提供 secret 通道，也不提供 `signed` 选项。

### 为什么

- kitty 的失败纪律要求安全策略由应用组合，而不是藏在插件里。
- 签名一旦进包，就必须同时决定密钥来源、轮换、验签失败是丢弃还是
  报错、时间戳与过期语义。这些都不是 cookie 语法。

### 下游怎么扩展

- 读侧 `_I.READ()` 只回答原始头字符串，写侧 `_I.WRITE(line)` 只接收成品
  行：两个槽都只做传输，不含语法。
- 签名下游派生 `Cookie` 并覆写 `set` / `get`，在调用上层实现前后改写值，
  不需要改本包。

## 解析器与操作类分离

### 决定

- `CookieParser` 是 `Cookie` 的内部类，住在 `Cookie/Parser/`，不从包入口
  导出。
- `CookieParser` 从记录的可迭代对象初始化，不认识 HTTP 头。
- `Cookie` 抽象操作类负责方向：`_I.READ()` 与 `_I.WRITE(line)`。
- 头解析 `parseCookieHeader` 住在 `Cookie/_Parser.mjs`，不对外导出；解析
  入口只有抽象类的读面。

### 代价

- 应用拿到的是记录集合，不是普通对象；取纯值要多一层 `.value`。
- 记录按引用保存，外部改写记录内容会反映到集合里。

## 解析器广播

### 决定

- 采用 Directory Parser Broadcast：每个模块目录一张 `_Parser.mjs`，先
  `export * from '../_Parser.mjs'`，再声明本目录的解析器。
- 消费点只导入**本目录**的表，统一用命名空间 `P`（如
  `import * as P from './_Parser.mjs'`）。表内部消费父表的解析器时同样
  走 `P`：同时写 `export * from '../_Parser.mjs'` 与
  `import * as P from '../_Parser.mjs'`，不在表里直接引用父表的裸名。
- 包内表的根是 `Cookie/_Parser.mjs`：名称/值断言、头部解析、选项校验与
  `Set-Cookie` 序列化都在这里。`src/` 根目录既无解析器也无消费点，因此
  不设表。
- `Cookie/Parser/_Parser.mjs` 只重导出父表，并声明 `CookieRecord` /
  `CookieRecords`。
- 解析器放在其消费点的最近公共祖先：`CookieName` / `CookieValue` 同时被
  `_Abstract.mjs` 与 `Parser/_Concrete.mjs` 使用，因此落在 `Cookie/`；
  `CookieRecord` 只被 `CookieRecords` 使用，因此落在 `Cookie/Parser/`。

### 为什么

- 固定导入形状后，解析器在目录间移动不需要改调用点。
- 序列化与解析同属 cookie 语法，放在同一张表，消费点只需一个导入。

## 解析口径

### 决定

- 坏 pair 只丢这一条：缺 `=`、空名、非 token 名、非 cookie-octet 值、
  引号不配对。
- 同名保留第一个。
- 不做 `decodeURIComponent`：值按线上原样保存。
- 单对两侧裁剪空白；值外层成对 DQUOTE 剥离。
- `$` 前缀名（`$Version`、`$Path` 等遗留属性）忽略。
- 读侧只解析一次并缓存，之后改 `_I.READ()` 的返回值不影响结果。

### 代价

- 与社区默认（`encodeURIComponent` 编解码）不同，编解码责任在调用方。
- 宽容丢弃意味着无法告诉调用方某一条为什么消失。

## 写侧

### 决定

- `set(name, value, options)` 校验后自己序列化成一行 `Set-Cookie`，再交给
  `_I.WRITE(line)`；sink 只负责把这一行追加到响应头。
- 属性集合固定为 `path`、`domain`、`maxAge`、`expires`、`secure`、
  `httpOnly`、`sameSite`；出现其它键直接抛错。
- 默认值材料化进记录：`path: '/'`、`httpOnly: true`、`sameSite: 'Lax'`、
  `secure: false`。
- `maxAge` 单位是秒，与线上 `Max-Age` 一致；`expires` 是 `Date`，序列化为
  `toUTCString()`。
- `sameSite` 大小写不敏感，落成 `Strict` / `Lax` / `None`；`None` 必须同时
  `secure: true`，否则抛错。
- 同名多次 `set` 产出多条 `Set-Cookie`，不实现 Koa 的 `overwrite`
  语义，也不维护"本次已写集合"。
- `delete()` 暂不实现。

### 为什么

- 序列化归本包：语法只有一份，实现器只该知道"往哪写一行"，否则每个
  协议适配都要重写一遍序列化。
- 未知属性键直接报错，避免拼写错误静默失效。
- `maxAge` 用秒：这是线上单位，换算交给调用方，避免 1000 倍的错。
- `delete` 现在只是 `set` 的过期形态，但必须带同一 `path` / `domain`
  才生效，所以等属性落地后再补。

### 待定

1. 是否需要读回本次已写的 `Set-Cookie`（覆盖语义与它同层）。
2. `Priority` / `Partitioned` 是否进入属性集合。
3. `secure` 是否由实现器按 `exchange.protocol` 推导（抽象层拿不到协议，
   只能给 `false`）。

## 与社区实现的差异

### 决定

- 删除用显式 `delete(name, options)`，不用 `set(name, null)`。
- 读面提供 `size` / `has` / `keys` / `values` / `entries`，等价于
  Express / Fastify 的 `request.cookies` 普通对象。
- 签名与 JSON 值不进本包（见上文边界）。
- `maxAge` 用秒：Koa / Express 用毫秒，Fastify / Hono 用秒，本包取线上
  单位。
- 默认 `sameSite: 'Lax'` 并显式写进头部；社区多数默认不发送该属性。
- 未知选项键抛错；社区多数静默忽略。

### 原因

- `null` 当命令在类型与可读性上都差一档，显式方法更适合本仓库风格。
- 迭代式读面让记录可以携带额外字段，而普通对象不能。
