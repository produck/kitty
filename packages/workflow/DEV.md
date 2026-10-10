# DEV — 实现笔记与决策日志

> 组织方式：按**主题/方面**，而非日期。每个主题只记**当前有效结论**；同一
> 主题后到的决策覆盖先前的（越新越有效），日期仅作追溯标注。

## 文档分工

- `ARCHITECTURE.md` / `DESIGN.md` / `ATTACHMENT-PORTS.md` / `DEPLOYMENT.md` /
  `src/Exchange/EXCHANGE.md` 写设计意图与稳定约定，面向"这个包想成为什么"。
- 本文件写实现期的事实与取舍，面向"代码现在为什么长这样"。代码注释只留
  TODO，推演过程一律落在这里。
- 结论一旦收敛，不定期做"结论压缩"：把 `## 决策日志` 里的条目并进上方对应
  主题，并从日志里删除。

## 架构基座

### 抽象层：@produck/es-abstract

- 声明面：`Abstract(cls, Abstract({...}), Abstract.Static({...}))`；
  `Member as M` 给契约（`M.Method().args(...).returns(...)`）。
- 抽象实例成员与静态槽都是**访问时惰性校验**，缺实现分别抛
  `Instance member "Symbol(…)" must be implemented in the subclass.` 与
  `Static member "…" must be implemented in the subclass.`。只声明不阻断
  `extends`。
- 契约的 `.returns()` 也在读取时校验（实测：`_I.SOURCE.GET` 答非
  `Readable` 时抛 `TypeError`）。
- **抽象构造器不能直接 `new`**，抛
  `Illegal construction on an abstract constructor.`；下游必须派生。
- `super()` 返回的是实例代理，所以构造器体内的 `this` 已是代理；符号槽写在
  目标上，`this[sym]` 读写照常穿透。`this[SYMBOL.CONSTRUCTOR]` 与 `new.target`
  等价。
- 因此**不用 JS 的 `#` 私有字段**：代理不认私有字段归属，方法里访问
  `this.#x` 会抛。本仓"私有"一律指 `I` 表的符号槽。

### 共享词汇：@produck/argot

- 统一从 argot 取 `Ow` / `ThrowTypeError` / `SYMBOL` / `Unit`；
  `@produck/ow` 与 `@produck/type-error` 不再直接声明（仍作为
  `@produck/es-abstract-*` 的传递依赖留在 lock）。
- `SYMBOL.CONSTRUCTOR` 是本仓捕获 `new.target` 的唯一写法，本地不再声明这
  个键。
- `Ow.throw(x)` 是**抛出实参本身**，不包装：`Ow.throw('…')` 抛的是裸字符串
  （无 `stack`、非 `Error`）。要 `Error` 用 `Ow.Error.Common('…')`。

### Symbol 表约定

- 三级可见性：`I` / `S` 私有，`$I` / `$S` 受保护，`_I` / `_S` 抽象（下游必须
  实现、或必须赋值）。
- 描述符：实例 `.#x` / `.$x` / `._x`；方法与 getter 带括号
  （`._getMode()`、`._getSource()`），字段不带；静态持类值的键以 `_CTOR`
  结尾。
- **空表不建、不导出**：`I` / `$I` / `_I` / `_S` 里一个键都没有，就不写那个
  `export`。
- `_Symbol.mjs` 只定义自己的表，是纯叶子；转发别人的表放 `_Borrow.mjs`，
  用 `export * as NAME from '…'` 的命名空间形式。
- 跨包借表：**直接用对方的键**，不另立符号、不做翻译。`Body` 就是这样——它
  的 `_S.DISTRIBUTOR_CTOR` 指向 `Fugue.Distributor`，介质槽
  `Fugue.SYMBOL.DISTRIBUTOR._S.DEGRADED_CHUNK_READER_CTOR` 由下游在具体
  Distributor 上赋，本仓不声明也不转发。

### 私有槽 + 只读 getter

构造期赋值、之后不变的成员一律写成「类字段 `[I.X] = null` + 构造器里
`this[I.X] = …` + `get x()`」，不再用 `this.x = …` 这种可写公有数据属性。已
改造：`Exchange.request` / `response`、`Request.header` / `body`、
`Response.header` / `body`、`Part.exchange`、`Body[I.DISTRIBUTOR]`。

判据是"**只读**"，不是"要不要暴露"：下游会读的（`request` / `response` /
`header` / `body` / `exchange`）配 getter，纯内部的（`Body` 的 distributor、
`$I.KIT` 等受保护槽）只有槽、没有 getter。

### 命名

- `new.target` 捕获的局部一律叫 `TargetConstructor`；`ctor` 这个缩写**只**留给
  符号键（`_S.REQUEST_CTOR` 等）。
- 具体基类不加 `Abstract` 前缀（`ExchangePart`）；`_Abstract.mjs` 里的类名加
  （`AbstractRequest`、`AbstractRequestBody`、`AbstractResponse`）。

## 观点 / 决策 / 结论

### Exchange 不再是成员总线

抽象成员下放到各自的 ExchangePart，Exchange 只留自己的四项（`IDENTITY` /
`SERVER` / `SERVER.PROTOCOL` / `HTTP_VERSION`）与两个静态槽。

- `_S.REQUEST_CTOR` / `_S.RESPONSE_CTOR`：分别收紧到
  `SubConstructorOf(Request.Abstract)` / `SubConstructorOf(Response.Abstract)`，
  下游赋具体类。
- 构造器：`this[I.REQUEST] = new TargetConstructor[_S.REQUEST_CTOR](this)`。
- 已删 `get isConsumed()` 与 `get isFinished()`。`isFinished` 改到 `Response`
  上读；`isConsumed` **后来在 `Request` 上也被删掉**（见"Request / Response"
  主题），现在全包没有这个概念。保留的委托 getter：`method` / `mode` / `url` /
  `statusCode` / `statusText` / `setStatus()` / `server` / `protocol` /
  `httpVersion`。
- `exchange = this` 已整行删除：Exchange 不再兼任自己的 Part，下游从
  `part.exchange` 拿到的就是 Exchange 本身。`toJSON()` 仍抛。
- 超时守卫读 `this.response.isFinished`——曾经写成 `this.isFinished`，删掉那
  个 getter 后会恒真、无条件 503。

### Exchange internal：adapter 的连接期上下文

`internal` **有用，要恢复**（2026-10-10 用户口径）：它是 **adapter 提供的、连接
期的业务对象记录**。不同具体 adapter 需要把这些内部上下文接进 Exchange 契约，
Exchange 才可能分别实现对应的抽象成员。

- 例子：h1 用 `req` / `res`；h2 用 `stream` / `req` / `res`；https 再加 TLS 相
  关的若干对象。记录的**具体形状由 adapter 自己定**，核心不解释——因此也没有
  validator（不能定形状）。
- 差异之大有实例：h1 与 h2 的 header 实现差很多——但那是下游各自实现
  `Header` 的 `_I.GET` / `_I.KEYS` 的事，核心不需要认识它们；`internal` 只是
  **把这些对象递进去的那只手**。
- 读者是**具体 Exchange 子类**（它要实现 adapter 相关的抽象成员），所以层级落
  `$I`（受保护）而不是 `I`——`f6897b2` 当年从 `_I` 迁到 `$I` 是对的。
- 它曾被 `2c06293` 以 "write-only constructor key" 删掉：在本仓确实只写不读，
  但那是**契约点**——读者在下游 adapter 的 Exchange 子类里，仓库里本来就看不
  见。那条删除理由覆盖不到这一点。
- 与 identity 的关系：identity 必须是**每个 exchange 一个的原生对象**（h1 用
  `req`、h2 用 `stream`，且**禁止用 `socket`**，因为 socket 是连接期的）；
  `internal` 正好是"连接期对象"的收纳处——同一片上下文里的两个用途。

### adapter 定义者的交付面

**adapter 定义者必须成套交付：具体 Adapter 类 + 对应的具体 Exchange 类**
（2026-10-10 用户结论）。理由是 `internal` 把两者耦合起来了：Exchange 的
adapter 相关抽象成员靠 `internal` 里的对象实现，而那份记录的形状只有 adapter
自己知道。

由此看下去还有三点：

- **不止两个类**。按现在的 `_S` 链，adapter 相关抽象成员分散在
  `Exchange` / `Request` / `Response` / `Header`×2 / `Body`×2 七处；Body 还
  要配 Distributor 子类与降级介质。缓解这份工作量的手段是**预设组装**，而它
  在 `@produck/kitty`，**不在本包**（见下）。
- **包边界：`kitty-workflow` 只定义框架模型、把契约分工做好**
  （2026-10-10 用户口径）。默认实现 / 预设组装归 `@produck/kitty`，所以
  "Core 要不要自带一套默认实现" 不是本包的待决事项，不用在这里收口。
- **Registry 目前没有位置承载这个配对**。`Adapter.Registry.registerAdapter()`
  的选项只有 `{ constructor, name, install }`——键是 **net.Server 子类**，
  "对应的具体 Exchange 类"没处放，只能靠 `install` 钩子自己安排（或干脆没
  接）。见"暂缓 / 待定"第 15 条。
- **`Implement.mjs` 与现架构错位的不只是键名**。它的选项树是
  `{ request: { header: { get, keys }, body: { data: { get } } } }`——把
  header / body 当**函数组**（因为当时它们是 Request/Response 的"冻结内嵌
  类"），而且只生成一个 `ImplementedExchange`。现在 header / body 是独立
  subject、经 `_S.HEADER_CTOR` / `_S.BODY_CTOR` 装配，这套选项树里根本
  没有对应的位置。所以要重写的不是键路径，是树的形状；它是否还属于本包也
  跟着变成了待定（待定第 3 条）。

### ExchangePart

- `Part/_Concrete.mjs` 是**具体**类（不是 `_Abstract`），六个 subject
  （`Request` / `Response` / `Header`×2 / `Body`×2）都从它继承，而它们自己
  是抽象构造函数。子类抽象不违反规范。
- `[I.EXCHANGE]` 私有槽 + `get exchange()`；构造器同时落
  `this[SYMBOL.CONSTRUCTOR] = new.target`。
- **`extends EventTarget`**（2026-10-10 定）：所有 part 都是事件目标，事件通道
  因此有了天然的落点（见待定第 13 条）。构造器改为先 `super()` 再落槽位。
  实测两个容易担心的地方都不成问题：经 `Abstract` 代理后
  `instanceof EventTarget` 成立；`Request` / `Response` 构造器里的
  `Object.freeze(this)` **不影响** `addEventListener` / `dispatchEvent`（事件挂在
  内部槽，不在属性上）。

### Request / Response

- `_S.{HEADER_CTOR, BODY_CTOR}` → `SubConstructorOf(Header.Abstract)` /
  `SubConstructorOf(Body.Abstract)`。
- `Request.get url()`：先 `new URL(raw)`，绝对 URL 直接成；相对 URL 用
  `this.header.get('host')` 拼 `this.exchange.protocol`，缺 host 抛
  `ThrowAdapter`。
- `Request/Header` 的 `_I.GET` / `_I.KEYS` 是直接符号键（不是 `{ GET: … }`
  嵌套），因为该 subject 只有一个概念。
- **`isConsumed` 已删**（2026-10-10），`get isConsumed()` 与 `_I.IS_CONSUMED`
  一起去掉：既然每次 `data` 都是完整拷贝，"consumed" 在分发语义下没有定义
  （body 永远不会"用尽"），因此也没有暴露必要。旧记录里 `IS_CONSUMED` 是"下
  游必须实现的抽象成员"，现在是**少了一条下游义务**。
- **不补"上游消费状态"**（同日定）：曾考虑给源流加私有引用、把它的 `closed`
  引出来，实测否掉了——
  - node 的 `Readable#closed` 是**布尔**（不是 Promise，Promise 在 WHATWG 的
    reader 上），且自 v18 起已由 `readableEnded` 取代；它**不区分成因**：
    `destroy()` 没读 / 正常读尽 / `destroy(err)` 三种情形下 `closed` 全是
    `true`（分别对应 `readableEnded` false / true / false，出错看 `errored`）；
  - 它会与分发语义打架，且**必然发生**：只读完两份 fork 中的 `fast` 那份
    时，node 源已经 `destroyed=true` `readableEnded=true`，而 `slow` 一个字
    还没读——源流状态由最快的读者（或 stash 上限）决定，与副本进度无关；
  - 它是**第二份账**：源流已有三处可记账（node 源、被 fugue 接管的 WHATWG
    流、fugue 自己的 `SourceReader`），而 fugue 独占读源、状态主人应该是它；
    它可能的独有价值（cancel / destroy）已由 `Fugue.Distributor#destroy()` 覆盖。
    将来若真要，语义得先定成一句话（候选：源已读尽 / 所有副本已读完 / 调用方
    那份已读完——三者互斥），且只给**收敛后的布尔**，不给 `closed`。

### Request Body 与 @produck/fugue

- 契约：`_I.SOURCE.GET()` 答 **node `Readable`**（下游交入站流）；
  `_S.DISTRIBUTOR_CTOR` 答 `Fugue.Distributor` 的具体子类。
- `data` = `distributor.fork()`，**每次访问都 fork 一份新的完整拷贝**
  （`body.data !== body.data`）。这既是 fugue 存在的意义，也是"从分配器 fork
  新的可读流"的字面落实。返回的是 **WHATWG `ReadableStream`**（不再过
  `Readable.fromWeb()`）。
- 转换边界只剩源侧一处：`Readable.toWeb(this[_I.SOURCE.GET]())`。契约两侧
  不同族——`_I.SOURCE.GET` 是 node `Readable`，`data` 是 WHATWG
  `ReadableStream`。**`data` 交 WHATWG 是有意决定**（2026-10-10 定）：它不算
  要收起来的"分配器细节"。
- 观测面**不做**（2026-10-10 定）。业务 handler 作者只需要 `data` 一项。理由：
  上了 fugue 之后，不再需要像 koa / express 那样在 exchange 生命周期上提供流
  的可观测性——fugue 把同构分发做到了不同作用域，每个作用域只关心**自己拿到
  的那几份流的状态**，而那是**流实例自身的状态**（WHATWG `ReadableStream` 的
  `locked` / reader 的 `closed`），不是 RequestBody 的状态。adapter 作者交完
  源流就退场，同样不需要观测。
- 随之定下：`degraded`（已落盘）/ `terminated` / 12 项 `options` / 10 个 warn
  码都不进公开面；`I.DISTRIBUTOR` **保持私有**，连"升格为 `$I` 给同仓子系统"
  的方案也否决（内部也不需要）。于是 `ExchangePart` 不必升为 `EventTarget`。
  （后半句当天晚些被推翻：`ExchangePart` 确实 `extends EventTarget` 了，见
  "ExchangePart"——但那是为**事件通道**留落点，与"状态 getter 不做"不冲突。）
- **源流状态不提供观测**：会与分发语义冲突——消费进度较慢的那份 fork 还没结
  束，却看见源流已关闭，观感是错的。
- **源流收尾：暂缓实现**（2026-10-10）。曾按"`close` 时 `destroy()`"写过一
  版，用户随即叫停：**代码里先别急着实现**，因为**可能会做一个延迟释放的决
  定**；而"先 `terminate()`"可能是更安全的策略——它是**同步门禁**。该实现已
  回退，当前 Body 只建 distributor、只开 `data`。
- **`terminate()` vs `destroy()`（实测：同一份 body、两份 fork、读完 `a` 的第
  一块后调用）**：
  - `terminate()`——**同步**，返回 `undefined`；只拒绝新的 `fork()`（`Error:
Distributor has been terminated`）；**已发出的副本继续读到各自终点**；源
    不取消。无需吞 rejection。
  - `destroy()`——异步返回 Promise；同样拒绝新 `fork()`；但**会 error 掉已发
    出的副本**，并**取消源**（实测 `readableEnded=false`）；且可能 reject（内
    部 `await agent.pullingSettled` 会把源读错重抛），当前没有错误通道（第 13
    条）只能吞掉。
  - 结论：`terminate()` 严格更安全——结束那一刻只**关门禁**（防结束后继续开
    新副本导致无界增长），把真正的释放（cancel 源 + error 副本 + 释放介质）
    留给更晚的时点，也就是"延迟释放"的形状。
- `'close'` 是**事实上的契约事件名**：`Exchange` 构造器用它清超时定时器，派发
  方是 `CompoundWorkflow`（`await workflow` 的 `finally` 里）。它没被文档化，
  语义也待澄清（见待定第 16 条）——"关闭时到底做什么"（terminate / destroy /
  延迟释放）现在也挂在它上面。

- **但事件通道是另一条线**：把 distributor 的信号引到 exchange 体系、让 handler
  用户针对事件做动作（如写日志），这件事未定，见"暂缓 / 待定"第 13 条。两者
  不矛盾：这一条关的是"不开状态 getter"，那条关的是"事件有没有通道"。
- **不自己定义 Distributor 层**。曾一度在 Body 里组装（WeakMap + 动态子类 +
  自造 `_S.DEGRADED_CHUNK_READER_CTOR` 再翻译成 fugue 的键），也一度提成
  `Body/Distributor/` 一层 subject。两者都撤了：Body 只认"整个具体
  Distributor"，介质契约回到 fugue 自己的公开面。
- **源流必须是字节流（`objectMode: false`）**。实测 objectMode 源会让 fugue
  的降级探针在第一次 pull 就误判越限，随后去读介质槽并抛
  `Static member "._transferrerCtor" must be implemented`。
  http1.1 / http2 的入站流本来就是字节流，不会踩。
- `_I.DATA.GET` 已删：`data` 由基类实现，下游不再提供。
- **包内还没有降级介质的实现**（`Fugue.DegradedChunkReader` 家族 +
  `Transferrer`）。

### Workflow / CompoundWorkflow

- `Workflow/_Abstract.mjs` 的抽象面只有 `_I.COMPOSE.EXTEND` 与
  `_I.COMPILE_ARTIFACT`。
- `Workflow` 构造器把自己的 Exchange 配置装到自己的 kit 上：
  `Exchange.Configuration.install(WorkflowKit, this)`。
- `get isFinalized()` 就是 `Object.isFrozen(this)`，没有单独布尔位。
- `CompoundWorkflow/_Borrow.mjs` 仍以
  `export * as WORKFLOW from '../Workflow/_Symbol.mjs'` 转发；这是本仓唯一还
  需要 `_Borrow.mjs` 的地方。

### 依赖治理

`packages/workflow/package.json` 的依赖共 9 条：`@produck/argot`、
`@produck/compose`、`@produck/deep-freeze-enumerable`、`@produck/es-abstract`、
`@produck/es-abstract-member-constructor`、`@produck/fugue`、
`@produck/is-sub-constructor`、`@produck/kit`、`is-plain-object`。

## 术语

- **subject**（主题目录）＝一个类一个目录：`_Abstract.mjs` 或
  `_Concrete.mjs`（存在性互斥）+ `index.mjs` + `_Symbol.mjs`（借表时多一个
  `_Borrow.mjs`）。目录路径即其符号命名空间。
- **part** ＝ `ExchangePart` 家族的实例（Request / Response / Header / Body
  以及后续成员）。
- **slot**（槽位）＝ `_S` 里的一个键，值是一个类引用，语义是"下游必须在这里
  挂上具体实现"。
- **fork** ＝ 从 `Fugue.Distributor` 取一份新的、从第 0 字节起的完整拷贝。
- `done`（数据到头）· `closed`（读取器/流被生命周期关闭）· `destroyed`（分发
  器销毁）——三个词不混用。
- `sealed` 已整档删除（原 `I.SEALED` / `$I.SEAL` 一族），不要再引入。
- **internal** ＝ adapter 提供的**连接期业务对象记录**（h1 的 req / res、h2 的
  stream / req / res、https 的 TLS 相关对象……）。形状由 adapter 定，核心不解
  释；它是 adapter 把上下文接进 Exchange 契约的那只手。
- **identity** ＝ adapter 从协议运行时里**挑**出的、每个 exchange 一个的原生对
  象（h1 用 `req`、h2 用 `stream`；**不用 `socket`**，那是连接期的），用于
  identity–exchange 强绑定去重。

## 暂缓 / 待定

1. **规范草案（`code-style/…/partial-constructor/README.md`）待修订**
   - `_Borrow.mjs` 该不该规定转发形状（现在只有 `export * as` 的惯例）；
   - BTB-1 用词是 "borrowed table"，但 `_A` 在本仓永远为空，实际转发的是"源
     模块的符号命名空间"；
   - 空表不构造/不导出——需要写明表清单是白名单而非必填集；
   - ABS-1 的 "expected to derive from" 是否覆盖**包内家族基类**
     （`ExchangePart` 是具体类却被六个 subject 继承）；
   - LAY-7（派生必须是抽象基类目录的**兄弟**）与 LAY-8（嵌套）在共享具体基
     类下互相打架；
   - `20-produck-commit.instructions.md` 的 "Workspace Draft Files" 举例给了
     `message.draft.ignore`，它并不匹配自己要求的 `*.ign*`。
2. **PUB-2 未做**：`src/index.mjs` 只导出 `Workflow`，尚未把 Workflow 的抽象
   成员符号（`_I.COMPOSE.EXTEND` / `_I.COMPILE_ARTIFACT`）按 PUB-3 以"选择"的
   形式开出去。参考实现的做法是包出口带 `SYMBOL.<模块>.<表>.<键>`，并直接暴
   露抽象 subject 供下游 `extends`。
3. **`Exchange/Implement.mjs` 未接线，且归属存疑**：内部仍引用已删的
   `_I.REQUEST.*` / `_I.STATUS.*` 键路径，`Exchange/index.mjs` 已不再导出它
   （否则整包在载入期就炸）。**要重写的是选项树的形状，不是键路径**——它把
   header / body 当函数组，而现在它们是独立 subject（见"adapter 定义者的交
   付面"）。另："用函数树生成具体类"这种工厂算**框架模型**（留本包）还是算
   **预设组装**（搬到 `@produck/kitty`），未定。用户口径："先把所有 subject
   的结构搞清楚"。
4. **Exchange 如何装到 `ExchangeKit` 未定**：`Exchange/Capability.mjs` 的
   `K_EXCHANGE` / `useExchange()` 只有读侧，全仓没有任何写入路径，也没有
   incoming exchange 的代码（server 事件 → `ExchangeKit` → 子类 →
   `handleExchange`）。候选：Exchange 构造器自装 / 导出
   `installExchange(kit, exchange)` / 走 PUB-2 把 `K_EXCHANGE` 叶子开出去。
5. **Body 与 `config` 的关系未定**：`Exchange/Config.mjs` 已有 `maxBodySize` /
   `maxRequestBodyBuffer` / `allowedBodyMethods`，一个都还没接到 fugue 上。
   要定 `maxBodySize` 对应 fugue 的哪一档（`MaxChunkStashByteLength`？还是硬
   上限 + 413）。
6. **默认降级介质由谁提供未定**：包内没有 `Fugue.DegradedChunkReader` 的实
   现（内存或临时文件）。按"不组装介质"的定调它不在 Body 层，但放在哪一级、
   要不要出，未定。
7. **`data` 是否改为缓存首次 fork 未定**：现在是每次访问新 fork。
8. **`Workflow/_Abstract.mjs` 两处 `Ow.throw('…')` 抛裸字符串**
   （`$I.ASSERT.FINALIZED` / `$I.ASSERT.NOT_FINALIZED`），同文件其它地方用的是
   `Ow.Error.Common`。要不要统一，未定。
9. **文档过时**：`ARCHITECTURE.md` 的公开 API 表、`DESIGN.md`、
   `src/Exchange/EXCHANGE.md` 里仍写着 `exchange.isConsumed` /
   `exchange.isFinished`，两者已在 Exchange 上删除，且 `isConsumed` 现在全包
   都不存在（`ARCHITECTURE.md` 里连 Request 的成员树也列着它）。`EXCHANGE.md`
   另有 "Planned: logical exchange identity getter" 之类未落地段落；
   `DESIGN.md` 还有两处 `_I.INTERNAL` / `$I.INTERNAL`（同一概念，写法不自洽），
   而该槽已在重构中删除——见第 14 条。
10. **`test/*.mjs` 是重构前的骨架**：仍 import `../src/Symbol.mjs` /
    `../src/Abstract.mjs`，并引用已删的 `Adapter.Registry.define` 等 API。
    `test/Transaction.test.mjs` 是空的，且已不被 `test/index.mjs` 引入。按
    `DESIGN.md` 这属于"设计沙盒"，暂未处理。
11. **Adapter / handler / kitty 三个域尚无代码**：10 个占位 workspace 只有
    `package.json`；`AdapterKit.*` 与 `Adapter.Registry.registerAdapter` 全仓
    零调用点。
12. **何时对 distributor 进行配置未定**：fugue 的选项是**逐实例**的
    （`Options.Tune` / `Options.Get`，`Preset` 只是若干 `Tune` 的打包），默认
    值来自它自己的 `Items.mjs`，安装点就在 `Distributor` 构造器里。而我们
    把 distributor 建在 `Body` 构造器里、随后锁进私有槽 `[I.DISTRIBUTOR]`，
    没有公开 getter——于是**目前没有任何时刻/入口能对它配置**。拆成三个子
    问题：(a) **谁配**——`Body` 把 `Exchange/Config.mjs` 的 `maxBodySize` 等
    翻译过去，还是下游在具体 Distributor 子类里自己 `Tune`；(b) **何时配**
    ——fugue 每项选项的**读取时机不同**，配晚了等于没配：
    `MaxChunkStashByteLength` / `DegradeOnChunkStashFullAndDone` 每趟 pull 都
    读，随时可调；`ForkedReadableStreamHighWaterMark` 每次 fork 读一次（第一
    份拷贝出去就固化）；读器/写器那几对重试预算分别在各自的 initialize /
    dump / drain 时读一次；(c) **入口形态**——加公开 `get distributor()`、加
    一个构造期回调的 `_I` 钩子，还是干脆全交给下游的 Distributor 子类构造
    器。
13. **distributor 的观测怎么导到 exchange 体系上，未定**（2026-10-10 记）：应
    该有个地方把 distributor 的信号（`fork` / `degrade` / `terminate` /
    `warn`）转发 / 代理进 exchange 体系，好让 handler 用户可以**针对事件**决定
    动作，比如写日志。**实现责任归属没想好**，候选：
    - 已定（2026-10-10）：`ExchangePart extends EventTarget`，所以候选之间的
      差别不再是"能不能挂事件"，而是**转发/代理的责任落在哪一层**；
    - `Body`——它持有 distributor，现在自己就是 `EventTarget`，最直接；
    - `Exchange`——它也是 `EventTarget`，又是 handler 拿到的对象，天然的
      事件挂载点；
    - `CompoundWorkflow` 的 **runtime exchange attacher**——机制已在
      （`I.MIXIN.EXCHANGE.ATTACHER.LIST`，exchange 经 `handleExchange` 到达时按
      序执行），不必新造概念；
    - `adapter`——它交出源流后就退场，最不像。
    - 连带要定：转发哪几种事件；warn 的 10 个 code 折不折叠；事件名用 fugue
      的词还是 kitty 的词（与"不让用户理解分配器细节"直接冲突）；listener
      抛错怎么办（是否污染 fugue 自己的派发）；订阅时机与解除（handler 在
      `use()` 时？执行时？）。
14. **恢复 `$I.INTERNAL` 的形态未定**：概念已确认有用（见"Exchange internal：
    adapter 的连接期上下文"），要定的是形状——
    - 通道：回到**构造参数** `constructor(ExchangeKit, internal)`（原样），还是
      改成 `_I.INTERNAL.GET()` 让 adapter 实现；
    - 层级：`$I`（受保护，具体子类可读）还是 `I`；
    - 谁传：adapter 直接 `new`，还是经由 `Exchange/Implement.mjs`（它现在既未
      接线、也未导出，`normalizeOptions` 里没有这一项）；
    - 要不要给 `internal` 定最小约束（比如必须是对象，且至少含 identity）。
15. **`Adapter.Registry` 要不要承载"具体 Exchange 类"未定**：现在它只键于
    net.Server 子类，选项是 `{ constructor, name, install }`。而 adapter 定义
    者必须成套交付 Adapter + Exchange（见"adapter 定义者的交付面"），这个配对
    目前无处安放。候选：选项里增加一个 Exchange 构造器项（并校
    `SubConstructorOf(Exchange.Abstract)`）；或者坚持由 `install` 钩子自己安
    排、Registry 只管 server 查表。倾向前者（可校验、可查表），但要先定
    `internal` 的形态（第 14 条）。
16. **`'close'` 的语义与契约化未定**：它现在被两侧依赖（`Exchange` 清超时定时
    器、`Body` 收尾 distributor），派发方却是 `CompoundWorkflow` 在
    `await workflow` 的 `finally` 里——一个字符串撑起了跨模块约定，但从未写进
    任何契约。要定的是：它算**公开契约**还是内部约定；语义是"**workflow 调用
    结束**"还是"**exchange 生命周期结束**"（两者不等价——前者意味着 handler
    之后仍持有 body 副本的异步任务会被收尾动作影响）；**关闭时到底做什么**
    （`terminate()` 同步门禁 / `destroy()` 立即释放 / 延迟释放，见"Request
    Body 与 @produck/fugue"的对照）；以及将来要不要换成符号 / 常量、要不要带上
    关闭原因。

## 决策日志（演进 · 按时间追加）

> 不稳定、演进中的决策先在此按时间（`### YYYY-MM-DD`）追加，保留来龙去脉；
> 一旦收敛为确定结论，不定期执行"结论压缩"——并入上方对应主题的"当前有效
> 结论"，并从本节移除。

### 2026-10-10

**Exchange 成员下放**（提交 `759ebbd` 前的整理期，45 文件 +501/−603）——

- 抽象成员从 Exchange 下放到各 ExchangePart；Exchange 不再直接依赖
  Request / Response 的具体实现，改成 `_S` 静态槽。
- 六个 subject 各自拥有 `_Symbol.mjs`，六个 `_Borrow.mjs` 全部删除——真正需要
  跨表的只剩 `CompoundWorkflow`。
- `Request Body` 的 tee + 内存/临时文件 spill 实现（约 180 行）整块删除，交给
  fugue；`AdapterGuard` 的相关包裹一并删。

**私有槽 + 只读 getter 定调**——

- 起因：Exchange 的 `request` / `response` 是构造期赋值的可写公有字段。定调为
  「私有槽 + getter」后，按同一判据推平到 `Request` / `Response` 的
  `header` / `body`（用户："ExchangePart 那些也有类似的情况"）。
- Exchange 的 `exchange = this` 由用户删除，没有改成 getter。

**依赖修剪**——

- 删掉 `@produck/ow` / `@produck/type-error` 的直接依赖，10 个文件的 import 统
  一到 `@produck/argot`。实测 `Ow.throw` 新旧语义一致（都抛实参本身），所以
  这不是行为变更。

**Body 接 fugue 的改形过程**（同一天四轮，最终形态见上）——

1. 只加 `_I.SOURCE.GET`（下游给源流），不接 Distributor：先定契约。
2. `data` 实现为 `Distributor#fork()`，介质装配一度写在 Body 里（WeakMap +
   动态子类 + 自造介质槽再翻译成 fugue 的键）。
3. 用户："层次不对，`AbstractRequestBody` 维护的是整个具体 Distributor，不负
   责组装降级介质" → 尝试提一层 `Body/Distributor/` subject（`_Symbol.mjs` 直
   接复用 fugue 的键，因此不需要翻译）。
4. 用户："不用自己再定义一层 Distributor 了" → `Body/Distributor/` 整个删除，
   `_S.DISTRIBUTOR_CTOR` 直接 `SubConstructorOf(Fugue.Distributor)`。

- 中间产物 `DistributorOf()` + WeakMap + 动态子类全部消失，Body 对 fugue 只剩
  两处引用。

**降级探针误判的实测记录**——

- 用 objectMode 的 `Readable.from([...])` 做源，第一次 pull 就走进
  `SourceConsumptionAgent.degradeIfNeeded()` → `$I.DEGRADE`；换
  `Readable.from([Buffer, Buffer], { objectMode: false })` 正常。stash 默认上限
  1 GiB（`Unit.Byte.GB`），所以误判一定来自 `byteLength` 统计而非阈值本身。

**组织级基线踩点**（不是本包的 bug，但会反复遇到）——

- `produck:lint` 的 `json/sort-keys` 有时要**跑两遍**才收敛；
- `produck:baseline` 的 `sync-workspace` 把 `workspaces` 里每个路径当硬要求，
  缺 `package.json` 直接 exit 2，而 `preflight` 不检查存在性——所以 10 个占位
  manifest 必须存在，否则基线永远失败；
- commit 草稿文件必须匹配 `*.ign*`；本仓惯例放 `logs/`（已被忽略）。

**探针脚本**——

- `logs/probe-exchange.ign.mjs`：以下游风格把 Exchange / Request / Response /
  Header / Body 全部具体化后跑断言（私有槽不可见、只读、fork 两次各自完整、
  槽位类型、`SubConstructorOf` 接受外部抽象构造器）。
- 它一直挂着的原因不是死锁，而是 `net.createServer()` 与 Exchange 自带的 2 分
  钟超时定时器吊住事件循环。加了 10 秒 `.unref()` 看门狗 + 末尾
  `process.exit(0)`，现在秒退。

**RequestBody 的观测面：不做**——

- 起因：想"围绕 RequestBody 做可观测机制"，我先把 fugue 的
  `degraded` / `terminated` / `options` / `getWarningCount` 直接摆成了四个公开
  getter；用户指正两件事：一是**该先商量**，二是这会把分配器的细节推给 kitty
  的用户。四个成员全部回退。
- 定受众时先选了三层（业务 handler 作者 / adapter 作者 / 框架内部子系统，
  **不含宿主运维**），随后逐层收敛：
  1. adapter 作者交完源流就退场，不需要观测；
  2. 同仓子系统也不需要——`I.DISTRIBUTOR` 连升为 `$I` 都不必；
  3. 业务面最后只剩 `data`：用了 fugue 就不需要在 exchange 生命周期上提供流的
     可观测性，每个作用域只关心自己那几份流的状态，而那是流实例自身的状态
     （`ReadableStream` 的 `locked` / reader 的 `closed`）。
- 明确的取舍：**源流状态不提供观测**，否则会出现"慢的那份 fork 还没读完、源流
  却已关闭"的错观感。
- 副产物：既然不需要**状态 getter**，当时认为 `ExchangePart` 不必升为
  `EventTarget`。**同日晚些时候推翻这一半**：`ExchangePart extends
EventTarget` 已定（见"ExchangePart"主题）——理由是**事件通道**需要个落点，
  而它与"不开状态 getter"不矛盾。剩下的唯一条目变成
  `Request._I.IS_CONSUMED` 的语义；事件通道本身另记一条（当时是第 14 条，后
  经重编为第 13 条）。

**`isConsumed` 删掉，连同"上游消费状态"一起否掉**——

- 用户口径："`isConsumed` 那也没有暴露必要了"。`get isConsumed()` 与
  `_I.IS_CONSUMED` 一齐移除（`Request/_Abstract.mjs` 一处 getter、一处契约
  项，`Request/_Symbol.mjs` 一处键）；待定列表里那条"语义未定"随之销掉。
- 在它之前先否掉了它的"另一种实现方式"：给源流加私有引用、把 `closed` 引出
  来。实测两张表（见"Request / Response"主题）：
  1. `source.closed` 不区分"读尽 / 被取消 / 出错"，三种都是 `true`；
  2. 只读完 `fast` 那份 fork 时源已 `destroyed=true` `readableEnded=true`，
     而 `slow` 一个字没读——正是用户早先担心的错观感，且属默认行为。
- 留下的话头：若将来真要"上游消费状态"，先定语义（源已读尽 / 所有副本已读
  完 / 调用方那份已读完，三者互斥），且只给收敛后的布尔，不给 `closed`。

**源流收尾：写过 `destroy()` 又回退，等"延迟释放"定案**——

- 我先按"`close` 时 `destroy()`"实现了一版（Body 挂一次性 `'close'` 监听 +
  `Common.ignoreRejection`）。用户次日口径：**代码里不要着急实现，因为可能会
  做一个延迟释放的决定；但先 `terminate()` 可能是比较安全的策略，且这个操作
  是个同步门禁**。实现已回退。
- 回退前把两者量了一遍（见"Request Body 与 @produck/fugue"的对照）：
  `terminate()` 是纯同步门禁，**已发出的副本继续读完**、源不取消；`destroy()`
  会 error 活副本、取消源，且可能 reject（当前无通道）。
- 这一轮同时确认了一件事：源流"是否被读尽"取决于**有没有人 `fork()` 过**
  （只 fork 不读，源也已走完），而不取决于读了多少。
