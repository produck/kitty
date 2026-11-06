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
- 签名等策略下游**包装** `useCookie(kit)` 的返回值（自己实现同名 `get` /
  `set`，内部转调本包对象），不派生 `Cookie`，也不需要 `_I` 符号。

### 公开面

- 包导出只有 `useCookie`；`Cookie`（抽象类）、`_I` 符号、`ExchangeCookie`
  都留在包内。
- 主体导出只承载 `Abstract` / `Concrete`，不携带符号表（SUB-2）；包内借用
  基类键一律走各自的 `_Borrow.mjs`（BTB-2）。
- 原因：下游只使用、不实现。不需要安装（无 Plugin / mixin / attacher）、
  不进管线（无 handler）、不扩展操作类（包装即可），所以没有需要跨包的
  抽象成员，PUB-2 不强制导出符号。

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
- 包内表的根是 `Cookie/_Parser.mjs`：名称/值断言与头部解析都在这里。
  `src/` 根目录既无解析器也无消费点，因此不设表。
- `normalizeOptions` 与 `serialize` 不住在表里：它们是去向的内部资源而不是
  解析器，单独放在 `Cookie/SetCookie.mjs`，只由同目录的抽象类导入。
- `Cookie/Parser/_Parser.mjs` 只重导出父表，并声明 `CookieRecord` /
  `CookieRecords`。
- 解析器放在其消费点的最近公共祖先：`CookieName` / `CookieValue` 同时被
  `_Abstract.mjs` 与 `Parser/_Concrete.mjs` 使用，因此落在 `Cookie/`；
  `CookieRecord` 只被 `CookieRecords` 使用，因此落在 `Cookie/Parser/`。

### 为什么

- 固定导入形状后，解析器在目录间移动不需要改调用点。
- 广播只承载"检查一个值"的函数；选项归一化与序列化都是去向的内部步骤，
  唯一的消费点就在同目录，没有跨层可达性需求，进表反而让表变成杂物箱。

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
  `httpOnly`、`sameSite`；`path` / `secure` / `httpOnly` / `sameSite` 有
  具体默认值，`domain` / `maxAge` / `expires` 的默认值是 `null`
  （表示不发送该属性，因此 session cookie 与 host-only cookie 可表达）。出现其它键直接抛错。
- 默认值材料化进记录：`path: '/'`、`httpOnly: true`、`sameSite: 'Lax'`、
  `secure: false`。
- `maxAge` 单位是秒，与线上 `Max-Age` 一致；`expires` 是 `Date`，序列化为
  `toUTCString()`。
- `sameSite` 大小写不敏感，落成 `Strict` / `Lax` / `None`；`None` 必须同时
  `secure: true`，否则抛错。
- 同名多次 `set` 产出多条 `Set-Cookie`，不实现 Koa 的 `overwrite`
  语义，也不维护"本次已写集合"。
- 归一化器只读自己认识的七个键，未知键不读取也不报错。
- `delete()` 暂不实现。

### 为什么

- 序列化归本包：语法只有一份，实现器只该知道"往哪写一行"，否则每个
  协议适配都要重写一遍序列化。
- `maxAge` 用秒：这是线上单位，换算交给调用方，避免 1000 倍的错。
- `delete` 现在只是 `set` 的过期形态，但必须带同一 `path` / `domain`
  才生效，所以等属性落地后再补。

### 待定

1. 是否需要读回本次已写的 `Set-Cookie`（覆盖语义与它同层）。
2. `Priority` / `Partitioned` 是否进入属性集合。
3. `secure` 是否由实现器按 `exchange.protocol` 推导（抽象层拿不到协议，
   只能给 `false`）。

## 选项归一化

### 决定

- 七个属性的默认值都写在目标记录里：`path: '/'`、`secure: false`、
  `httpOnly: true`、`sameSite: 'Lax'`，以及 `domain` / `maxAge` /
  `expires` 的 `null`。输入在顶部一次解构成 `_x`，解构默认值取自
  目标（显式 `undefined` 也会落到默认值），然后一节点一块：
  `if (合法) options.x = _x; else throw`。
- `null` 是这三项的合法默认值：校验通过并原样写入，由 `serialize` 的
  `!== null` 保证不出现在头部。判定用 `Is.Type.*` / `Is.Instance.*`，
  错误消息用名词短语（`non-empty string`、`boolean`、`valid Date`）。
- 归一化器只负责给序列化器交出唯一合法形状。内部形状里“没有该属性”用哪个
  值表示，由序列化器定义：现在是 `null`（`serialize` 跳过它），
  `normalizeOptions` 的默认值与校验都跟着它走；序列化器若改用别的信号，
  这里同步改。
- 拒绝一律用字面路径：`args[0]`、`args[0].path`、`args[0].sameSite`。
  路径从归一化器自身的参数往外拼，只允许索引插值。
- 叶子自己校验：每个节点的判定都写在自己块内，不抽读取分支的助手；
  av-octet 正则提为 `SetCookie.mjs` 的模块级常量 `AV_OCTETS`，path 与
  domain 共用同一字符集（共用的是正则对象，不是读取流程）。
- 不用键表、不做键驱动分派（NRM-17），也不额外校验未知键。
- 归一化顺序固定：`path` → `secure` → `httpOnly` → `domain` → `maxAge` →
  `expires` → `sameSite`；`sameSite: 'none'` 的 Secure 约束在同一块内检查，
  因为它依赖已经写好的 `options.secure`。

### 代价

- 代码变长，叶子校验重复。
- 未知键被静默忽略：拼错的键名不会报错，只是不生效。
- 记录里允许 `null`：它到不了头部，但依赖 `serialize` 对
  `domain` / `maxAge` / `expires` 的 `!== null` 判断；改成无条件输出就会
  漏出去。

## Bridge 与能力入口

### 决定

- `useCookie(kit)` = `Bridge.get(useExchange(kit))`：不经过安装期，直接由
  exchange 派生，能力随 exchange 存在而存在。
- `Bridge.get(exchange)` 用 `WeakMap<exchange, ExchangeCookie>` 缓存实例，
  首次访问才构造（懒加载），同一 exchange 永远拿到同一个对象。
- 具体主体 `ExchangeCookie` 是 `Cookie` 的派生，按 partial-constructor 规范
  放在与 `Cookie/` **平级**的主体目录：`_Concrete.mjs`、`_Symbol.mjs`
  （自有 `I.EXCHANGE`）、`_Borrow.mjs`（`COOKIE._I`）、`index.mjs`。
- 实现槽写成 `[COOKIE._I.READ]()` / `[COOKIE._I.WRITE](line)`；`Cookie` 的
  符号表只放自己的键，不放派生类的东西。
- `_I.READ()` 取 `exchange.request.header.get('cookie') ?? ''`，
  `_I.WRITE(line)` 追加到 `exchange.response.header`。
- ws exchange 没有 `response`，写入直接抛 `The exchange has no response.`。
- `Bridge` 通过主体导出 `./ExchangeCookie/index.mjs` 取 `Concrete`，不直接
  引用 `_Concrete.mjs`。

### 代价

- 读侧与写侧都依赖 `exchange.request` / `exchange.response` 这两个公开
  成员，exchange 家族若改名，本层要跟着改。

## 与社区实现的差异

### 决定

- 删除用显式 `delete(name, options)`，不用 `set(name, null)`。
- 读面提供 `size` / `has` / `keys` / `values` / `entries`，等价于
  Express / Fastify 的 `request.cookies` 普通对象。
- 签名与 JSON 值不进本包（见上文边界）。
- `maxAge` 用秒：Koa / Express 用毫秒，Fastify / Hono 用秒，本包取线上
  单位。
- 默认 `sameSite: 'Lax'` 并显式写进头部；社区多数默认不发送该属性。
- 未知选项键不检查，与社区一致。

### 原因

- `null` 当命令在类型与可读性上都差一档，显式方法更适合本仓库风格。
- 迭代式读面让记录可以携带额外字段，而普通对象不能。
