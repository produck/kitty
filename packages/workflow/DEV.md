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
- `test/Adapter.example.mjs`——**只读的接口对照物**（不被 `test/index.mjs`
  引用，不执行）。它把 adapter 那一侧的全部 `_I` / `_S` 义务按调用顺序摆在一
  处，并在文件尾部记下"写它时暴露的设计问题"。改接口时先看它。

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

`internal` **有用，已恢复**（2026-10-10 用户口径；形态 2026-10-11 定，见本节末
尾）：它是 **adapter 提供的、连接期的业务对象记录**。不同具体 adapter 需要把
这些内部上下文接进 Exchange 契约，Exchange 才可能分别实现对应的抽象成员。

- 例子：h1 用 `req` / `res`；h2 用 `stream` / `req` / `res`；https 再加 TLS 相
  关的若干对象。记录的**具体形状由 adapter 自己定**，核心不解释——因此也没有
  validator（不能定形状）。
- 差异之大有实例：h1 与 h2 的 header 实现差很多——但那是下游各自实现
  `Header` 的 `_I.GET` / `_I.KEYS` 的事，核心不需要认识它们；`internal` 只是
  **把这些对象递进去的那只手**。
- 读者是**具体 Exchange 子类**（它要实现 adapter 相关的抽象成员），所以层级落
  `$I`（受保护）而不是 `I`——`f6897b2` 当年从 `_I` 迁到 `$I` 是对的。
- **它是结构上必需的，不只是"有用"**（2026-10-11 写例子时实测）：冻结让下游具
  体类**存不下自己的任何字段**——子类字段初始化在 `super()` 返回**之后**才跑，
  而基类构造器末尾 `Object.freeze(this)` → `Cannot define property field,
object is not extensible`。**2026-10-11 的改形把冻结面收窄了**：`Exchange` 基
  类**不再冻结**（用户手工重构），所以具体 Exchange 能持有自己的字段——存
  `internal` 就是它的第一个用途；`Request` / `Response` 仍然冻结，它们的具体类
  只能经 `this.exchange` 读（`Workflow` 也仍冻结）。冻结不再统一是**有意的不对
  称**：`internal` 的收纳点是 Exchange，part 只是读者。
- **形态已定（2026-10-11，已落地）**：`internal` 回到**构造参数**
  `constructor(ExchangeKit, internal)`，落私有槽 `I.INTERNAL`（不导出到 `$I`）；
  读面是受保护的 `get [$I.IDENTITY]()`——它把 `this[I.INTERNAL]` 作为**实参**交
  给 adapter 实现的 `_I.IDENTITY.GET(internal)`。于是 adapter 拿得到记录，而核心
  一行都不解释它的形状。用户口径原话："毕竟 `INTERNAL` 无法设置为公有，保护级
  不出 package，所以 adaptor 只能走 exchange 类内的参数传递了。"
  - **不再有"挂到 kit 上"的候选**：kit 是核心的部署对象，`internal` 是 adapter
    的业务记录，所有权与生命周期都不同；参数传递少一个写入钩子。
  - **不给 validator**：形状由 adapter 定（上面的"不能定形状"），代价是 adapter
    传错东西时错误发生在它自己的成员实现里。
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
- **配对已安放（2026-10-11，已落地）**：`Adapter.Registry.registerAdapter()` 的
  选项增加了 **`Exchange`**，且**必填**——注册期校
  `SubConstructorOf(Exchange.Abstract)`，不合法就
  `ThrowTypeError('options.Exchange', 'sub class of Exchange.Abstract')`；键仍
  是 net.Server 子类。代价是一条新依赖边 `Adapter → Exchange`（实测**无环**：
  `Adapter` 的唯一引用者是 `CompoundWorkflow`，而 `Exchange/Utils.mjs` 只依赖
  argot）。见"暂缓 / 待定"第 15 条。
  - 顺带实测的既有 quirk：`isSubConstructor` 是**严格**的（`X` 不算自己的子
    类），所以 `constructor` 的默认值 `net.Server` **永远过不了这条校验**——
    adapter 必须显式给一个真子类。（待定第 19 条。）
- **`Implement.mjs` 与现架构错位的不只是键名**。它的选项树是
  `{ request: { header: { get, keys }, body: { data: { get } } } }`——把
  header / body 当**函数组**（因为当时它们是 Request/Response 的"冻结内嵌
  类"），而且只生成一个 `ImplementedExchange`。现在 header / body 是独立
  subject、经 `_S.HEADER_CTOR` / `_S.BODY_CTOR` 装配，这套选项树里根本
  没有对应的位置。所以要重写的不是键路径，是树的形状；它是否还属于本包也
  跟着变成了待定（待定第 3 条）。

### Exchange 的构造与装配

**装配由框架做，adapter 只交一个类和一份记录**（2026-10-11 落地：用户手工重构，
本 agent 收尾）。`CompoundWorkflow.handleExchange(internal)` 是 Exchange 的**唯
一构造点**，一次收口五件事：

1. 派生 `ExchangeKit`（`DeploymentKit('Kitty<Exchange>')`）；
2. `new adapter.Exchange(ExchangeKit, internal)`——类来自 `Adapter.Registry`
   记录的 `Exchange` 项（注册期已校），`internal` 走参数；**Exchange 在自己的
   构造器里就把自己挂到 `ExchangeKit` 上**（`K_EXCHANGE`）；
3. 读一次 `exchange[$I.IDENTITY]`，用 `handledExchanges`（**按 identity**，不再
   按实例）拒绝重复派发；
4. 跑 attachers（deployment 级在前、mixin 级在后）与 handler pipeline；
5. `finally` 里 `exchange.dispatchEvent(new Event('close'))`。

- **`K_EXCHANGE` 的写侧只有一处，就在 Exchange 构造器里**（2026-10-11 用户口
  径）："在构造后由外部附着看上去时机过于落后，怕类似 `startTiming` 这样的动作
  有副作用依赖 `ExchangeKit`"。`handleExchange` 不再写它（写侧也不导出），
  `useExchange()` 仍是读面。
- **代价：挂在 kit 上的是"构造期可见的那个对象"，不是 `new` 的返回值**
  （2026-10-11 实测，详见待定第 20 条）：`Abstract()` 在 `Reflect.construct()`
  **之后**才包代理，于是 `K_EXCHANGE === part.exchange` 成立，而
  `K_EXCHANGE === new` 的返回值**不成立**；`useExchange(kit)` 因此给到 handler
  的是**未代理**实例。
- **两层守卫合一**：`ARCHITECTURE.md` 原先描述的"identity 消耗在模型层、重复派
  发校验在桥层"的**两层分离**，现在两件事同处 `handleExchange` 一个函数。这是
  构造点搬进来的必然结果，那份文档要跟着改。
- **守卫强度是净放宽**：构造期校验收窄为"注册期校类合法性"，原先的
  `K_DEPLOYMENT_SELF` 派生校验、`ExchangeKit !== DeploymentKit`、
  `instanceof Exchange.Abstract`、`exchange.server === server` **全被删掉**。留下
  的只有注册期的 `SubConstructorOf` 与 identity 去重。含义：`handleExchange`
  可以被塞进任意 kit（只要它是 kit），不再要求它派生自当前 DeploymentKit。
- **顺序确定化是真实收益**：`close` 派发、超时定时器起点、attachers 的相对次序
  不再取决于 adapter 的 listener 怎么写——adapter 只决定"这个事件要不要产生一
  个 exchange"。
- **仍未定的两处**：`internal` 没有 validator（形状归 adapter）；写回响应的路由
  悬空（待定第 16 条）。

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
- **`Parser.mjs` 也跟着 subject 分区**（2026-10-11）：校验词汇归它的 subject。
  现在 `Request/Parser.mjs` 持有 `HttpMethod` / `ExchangeMode`（前者原本在共享
  的 `Exchange/Parser.mjs` 里），`Request/index.mjs` 里
  `export * as Parser`；共享的那份只剩跨界词汇（HTTP 版本、状态码、协议、
  header 名/值、`Iterable`、配置用的整数校验）与 `HttpMethodList`。
  `HttpMethodList` 留在 Exchange 侧但**从 `Request/Parser.mjs` 引 `HttpMethod`**
  ——于是多了一条"Exchange 级模块依赖 Request 级"的边，与
  `Exchange/_Abstract.mjs` 引 `Request/index.mjs` 同向，可以接受。
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

> 条目编号是**引用锚点**，因此收敛后**不删号、不重排**：已定的条目在正文里标
> "已定"并回填指针。

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
4. **Exchange 如何装到 `ExchangeKit`——已定（2026-10-11，已落地）**：
   `Exchange/Capability.mjs` 的
   `K_EXCHANGE` / `useExchange()` 只有读侧，全仓没有任何写入路径，也没有
   incoming exchange 的代码（server 事件 → `ExchangeKit` → 子类 →
   `handleExchange`）。候选：Exchange 构造器自装 / 导出
   `installExchange(kit, exchange)` / 走 PUB-2 把 `K_EXCHANGE` 叶子开出去。
   - **并且全仓没有"实例化 Exchange"的点**（2026-10-11 核实）：`src/` 里所有
     `new …` 都在建 **part**（`Exchange` 建 Request/Response、它们再建
     Header/Body、Body 再建 Distributor），没有一处 `new <Exchange>`；
     `CompoundWorkflow.handleExchange` 只用 `touchExchange(ExchangeKit)`
     **读**，并把它当作"别人应该已经装好了"（缺了就
     `Adapter.Throw('Exchange is not installed.')`）；`Exchange/Implement.mjs`
     返回的是**类**（`SCP(class ImplementedExchange extends …)`）而不是实例，且
     未导出。全仓唯一的实例化点在探针里（`logs/probe-exchange.ign.mjs`）。
   - 于是缺的是一条链，且它有顺序：**谁 `new`**（要有具体类）→ **哪个类**
     （第 15 条）→ **`internal` 怎么传**（第 14 条）→ **装到 kit**（本条）→
     `handleExchange`。Exchange 构造器又是整棵 part 树的入口，所以这一环缺着，
     下游就没有任何东西能跑起来。
     - 构造点本身已有候选：**搬进 `handleExchange`**，见第 17 条。
   - **结论（2026-10-11 回填）**：写侧在 **Exchange 构造器**（第 20 条），
     `K_EXCHANGE` / `useExchange()` 的读面仍给 handler，`K_EXCHANGE` 不导出。上面
     那串候选一个也没用上。
   - **构造期守卫全部消失**：`touchExchange(ExchangeKit)` 的读取与
     `Adapter.Throw('Exchange is not installed.')` 一并没了，也不再校
     `K_DEPLOYMENT_SELF` 派生、`ExchangeKit !== DeploymentKit`、
     `instanceof Exchange.Abstract`、`exchange.server === server`；留下的只剩
     注册期的 `SubConstructorOf` 与 identity 去重。这是**净放宽**，含义写在
     "Exchange 的构造与装配"里。
   - incoming exchange 的**前半段仍在 adapter 侧**（server 事件 → listener），
     本仓零调用点（第 11 条）。
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
   - **2026-10-11 本轮已修**：`handleExchange` 的签名与守卫清单、"两层分离"、
     "adapter 自装 Exchange"、identity 段落（`ARCHITECTURE.md`）；`DESIGN.md`
     的 identity 计划段与 "Current required behaviors" 清单。
   - **仍待处理**：两份文档里的 `exchange.isConsumed` / `exchange.isFinished`
     行、`AdapterGuard` 描述、`Exchange.Implement()` 段落（第 3 条）、Request
     成员树。
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
14. **恢复 `$I.INTERNAL` 的形态——已定（2026-10-11，已落地）**：概念已确认有用（见"Exchange internal：
    adapter 的连接期上下文"），要定的是形状——
    - 通道：回到**构造参数** `constructor(ExchangeKit, internal)`（原样），还是
      改成 `_I.INTERNAL.GET()` 让 adapter 实现；
    - 层级：`$I`（受保护，具体子类可读）还是 `I`；
    - 谁传：adapter 直接 `new`，还是经由 `Exchange/Implement.mjs`（它现在既未
      接线、也未导出，`normalizeOptions` 里没有这一项）；
    - 要不要给 `internal` 定最小约束（比如必须是对象，且至少含 identity）。
    - 若走第 17 条的候选（`handleExchange` 里构造），这条收窄成"**走参数还是挂
      在 kit 上**"。
    - **结论（2026-10-11 回填）**：通道＝**构造参数**
      `constructor(ExchangeKit, internal)`；层级＝**私有槽 `I.INTERNAL`**（不升
      `$I`，`$I` 上只有受保护的 `get [$I.IDENTITY]()`）；谁传＝`handleExchange`
      的入参；约束＝**不设 validator**（形状归 adapter）。"挂在 kit 上"的候选作
      废：所有权与生命周期都不同。细节见"Exchange internal：adapter 的连接期
      上下文"。
      - **遗留（未定）**：`handleExchange` 对 `internal` 现状**不做任何校验**
        （连"必须是对象"都没有）。符合"不设 validator"的本意，还是入口该补一句
        极浅的检查？未定。
15. **`Adapter.Registry` 要不要承载"具体 Exchange 类"——已定（2026-10-11，已落地）**：现在它只键于
    net.Server 子类，选项是 `{ constructor, name, install }`。而 adapter 定义
    者必须成套交付 Adapter + Exchange（见"adapter 定义者的交付面"），这个配对
    目前无处安放。候选：选项里增加一个 Exchange 构造器项（并校
    `SubConstructorOf(Exchange.Abstract)`）；或者坚持由 `install` 钩子自己安
    排、Registry 只管 server 查表。倾向前者（可校验、可查表），但要先定
    `internal` 的形态（第 14 条）。第 17 条那条候选就是这项的消费者——两个一起
    定更省事。
    - **结论（2026-10-11 回填）——取前者**：选项增加 **`Exchange`**、**必填**，
      注册期校 `SubConstructorOf(Exchange.Abstract)`，不合法抛
      `ThrowTypeError('options.Exchange', 'sub class of Exchange.Abstract')`。
      代价是一条新边 `Adapter → Exchange`（实测无环）。
16. **`'close'` 的语义与契约化未定**：它现在被两侧依赖（`Exchange` 清超时定时
    器、`Body` 收尾 distributor），派发方却是 `CompoundWorkflow` 在
    `await workflow` 的 `finally` 里——一个字符串撑起了跨模块约定，但从未写进
    任何契约。要定的是：它算**公开契约**还是内部约定；语义是"**workflow 调用
    结束**"还是"**exchange 生命周期结束**"（两者不等价——前者意味着 handler
    之后仍持有 body 副本的异步任务会被收尾动作影响）；**关闭时到底做什么**
    （`terminate()` 同步门禁 / `destroy()` 立即释放 / 延迟释放，见"Request
    Body 与 @produck/fugue"的对照）；以及将来要不要换成符号 / 常量、要不要带上
    关闭原因。
    - 依赖面缩小了：曾经是**两侧**（`Exchange` 清超时定时器、`Body` 收尾
      distributor），Body 侧的 `destroy()` 已按用户口径回退，所以现在只有
      `Exchange` 一处。
    - **新增的悬空点（2026-10-11，本次重构暴露）**：构造点搬进 `handleExchange`
      后，**listener 手里不再有 Exchange**（`handleExchange` 不返回它，
      `K_EXCHANGE` 的读侧是给 handler 的）——"把响应写回 socket"这一步就没了
      着落。三条候选：①`handleExchange` 返回 exchange，listener 照旧
      `respond(exchange, res)`；②具体 Exchange 在自己的构造器里订阅 `close` 时
      写回（例子现在就是这么写的，标了 `[pending 16]`）；③让 attacher 或一个专
      用 hook 承担写回。用户定之前，`test/Adapter.example.mjs` 只是"按现码能跑
      通"的一种写法。
17. **Exchange 的构造点搬进 `handleExchange`——已实现（2026-10-11）**：用户判断
    "**在这里创建好像正合适，因为 adapter 未来会提供 Exchange 的具体实现**"。
    确实契合：`handleExchange` 已是唯一运行时入口，闭包里已有 `adapter` /
    `server` / `handledExchanges`，加上 `internal` 就是完整的构造材料；adapter
    侧少一步——listener 不再自己 `new` 与写 `K_EXCHANGE`，只
    `return AdapterKit.handleExchange(ExchangeKit, internal)`。（`AdapterKit`
    自己是 `DeploymentKit('Kitty<Adapter>')`，所以 `AdapterKit(...)` 派生的
    kit 天然满足 `K_DEPLOYMENT_SELF`，这条路现在是通的。）
    - **它一次收口四环**：谁 `new` → 就是这里；哪个类 → adapter 记录里的一项
      （第 15 条有了明确消费者）；`internal` 怎么传 → 入参（第 14 条收窄）；
      装到 kit → 在这里写（第 4 条只剩"写侧导不导出"）。
    - **待定一：identity 守卫搬不搬**。`ARCHITECTURE.md` 明写了**两层分离**
      ——identity 消耗在 Exchange 构造期（模型层）、同一实例重复派发在
      `handleExchange`（桥层）。构造点搬进来后两个守卫就同处一个函数。我倾向
      **守卫留在构造器**（保住文档意图），代价是"构造后校验失败会烧掉
      identity"——那是 adapter bug 的快速失败路径，可接受；配套做法是把构造前
      的校验做满（kit 派生合法性、kit ≠ DeploymentKit、`adapter.Exchange` 在
      **注册期**就校 `SubConstructorOf(Exchange.Abstract)`），让构造后的校验只
      剩 `exchange.server === server`。若改主意要"只有一个登记点"，就两层合
      一，那段文档得跟着改。
    - **待定二：`internal` 走参数还是挂在 kit 上**。参数更显式、少一个钩子
      （倾向）；挂 kit 则内部子系统将来也能读到，代价是多一个写入钩子、
      `internal` 生命周期变长。
    - **待定三：`K_EXCHANGE` 的写侧导不导出**。倾向**不导出**——写只发生在
      `handleExchange` 里，读侧（`useExchange`）就是给 handler 的纯读面。
    - **两个实现细节**：构造必须在 `try/finally` **之前**（否则构造失败时那个
      `finally` 还会去派 `close`，而那时没有 exchange）；`handledExchanges` 的
      登记时机不变（构造之后、执行之前）。
    - **待定四："类从哪来"是一个新入口**。框架实例化就必须拿到具体 Exchange
      类；来源只有两条——`AdapterKit` 新增一个交出类的钩子，或
      `Adapter.Registry` 的记录里多一项（第 15 条）。这条不定，"框架实例化"就
      落不了地。
    - **待定五：`handleExchange(ExchangeKit, internal)` 的守卫强度**。`internal`
      是否必填（框架构造时必须齐备，否则 adapter 相关成员无从实现）；
      `ExchangeKit` 的既有校验（派生合法性、不得等于 DeploymentKit）不变。
    - **收益的准确说法（别夸大）**：adapter **并不交出控制权**——"这个事件要不
      要产生一个 exchange"仍然由它写的 listener 决定；改的只是"造 + 装"这两个
      动作。实际收益三条：①少一处**未文档化的约定**（现在 adapter 必须记得写
      `K_EXCHANGE`，而且要在 `handleExchange` 之前写好）；②一部分校验能前移
      （`SubConstructorOf(Exchange.Abstract)` 在**注册期**校，而不是运行期
      `instanceof` 事后校）；③顺序确定化（`close` 派发、超时定时器、attachers
      的相对次序不再取决于 adapter 怎么写）。
    - **五个子项的结论（2026-10-11 回填）**：
      1. identity 守卫搬不搬——**搬了，且两层归一**：`handleExchange` 里读一次
         `exchange[$I.IDENTITY]` 就用它去重（`handledExchanges` 从实例集合改成
         identity 集合）。`ARCHITECTURE.md` 的"两层分离"要同步改。
      2. `internal` 走参数还是挂 kit——**走参数**（第 14 条）。
      3. `K_EXCHANGE` 写侧导不导出——**不导出**；实际写点在 **Exchange 构造器**
         （2026-10-11 用户口径，见第 20 条），不在 `handleExchange`。
      4. "类从哪来"——**`Adapter.Registry` 记录的 `Exchange` 项**（第 15 条）。
      5. 守卫强度——`ExchangeKit` 的既有校验**已被删除**，构造前后的校验只剩注册
         期那一道；`internal` 无校验。净放宽（见第 4 条）。
    - **两个实现细节都照做了**：构造在 `try/finally` **之前**；`handledExchanges`
      的登记在构造之后、执行之前。
18. **header `_I.GET` 的契约与实现不符**（2026-10-11 写例子时发现）：`Request`
    与 `Response` 的 Header subject 都把 `_I.GET` 声明为
    `.returns(M.String)`，但 `has()` 与 `Request.get url()` 都靠 `undefined`
    判"这个 header 不存在"，而契约会用
    `Invalid "member", one "string" expected.` 拦下 `undefined`（实测）。另外
    `res.getHeader()` 还可能答 number 或数组，同样违约。难点：`returns()` 只收
    **一个** parser、method member 是**一次性**的（不能再 `.returns()` 第二次），
    而 Member 词表（`Any` / `String` / `Undefined` / `OrPromise`…）里没有并集或
    可选组合子——所以要自己写一个 parser（例如 `Optional(M.String)`，与
    `OrPromise(parser)` 同形）。
19. **`Adapter.Registry` 的 `constructor` 默认值不可达**（2026-10-11 写例子时实
    测）：`isSubConstructor` 是**严格**的——`isSubConstructor(net.Server,
net.Server)` 为 `false`。而 `normalizeOptions` 的默认值正是 `net.Server`，
    于是**省略 `constructor` 必然抛** `Invalid "options.constructor", one "sub
class of net.Server" expected.`：默认值是死代码，而"必填"这件事没写在任何
    地方。两种收口：①删掉默认值、明记必填；②改成
    `X === net.Server || isSubConstructor(X, net.Server)`，让默认值名副其实。倾
    向②。未定。
20. **`K_EXCHANGE` 上是未代理实例，`new` 返回的是代理**（2026-10-11 实测，构造
    期附着的副作用）：`@produck/es-abstract` 的 `AbstractConstructor` 在
    `Reflect.construct(target, argumentList, newTarget)` **之后**才
    `new Proxy(instance, instanceProxyHandler)`。所以同一个 exchange 有两个面：
    - **未代理实例**：基类构造器里的 `this`、part 们拿到的 `this.exchange`、现在
      `K_EXCHANGE` 上挂的那个；
    - **代理**：adapter 子类构造器里的 `this`（`super()` 的返回值接上来的）、
      `new adapter.Exchange(...)` 的返回值。
      由此得到三条可用判据：`K_EXCHANGE === part.exchange` 成立；
      `K_EXCHANGE === new` 的返回值**不**成立；adapter 的 Exchange 构造器里
      `this === this.request.exchange` **为 false**。
    - **要定的**：`useExchange()` 是 handler 面，现拿到未代理实例，于是那四个
      `_I.*` 抽象成员的 `M.Method().returns(...)` 校验在 handler 路径上**不再触
      发**（校验只存在于代理的 `get` 陷阱里）。三条路：①就这样（承认 handler
      面不校验）；②构造期先挂未代理实例、`handleExchange` 拿到代理后立即改成代
      理（同一个槽先后两个值，构造期读者与稳态读者看到不同对象）；③把那四个成员
      的校验从不依赖代理的位置再校一遍。
    - 同源事实（与 `K_EXCHANGE` 无关但同因）：**任何** adapter 具体类的构造器里
      `this` 都是代理，而 part 的 `.exchange` 是未代理实例——全包同时存在两把
      "同一个 exchange"的尺子。

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

**核实：全仓没有实例化 Exchange 的点；候选是搬进 `handleExchange`**——

- 用户先问"现在还没有实例化 Exchange 的点是不是"，核实属实：`src/` 里所有
  `new` 都在建 part，`handleExchange` 只用 `touchExchange` **读**，
  `Exchange/Implement.mjs` 返回的是类不是实例，`K_EXCHANGE` 没有写入路径。
  唯一的实例化点在探针里。
- 随后用户判断"**在这里创建好像正合适，因为 adapter 未来会提供 Exchange 的
  具体实现**"，并要我**先记录到 DEV**（不动代码）。已记为待定第 17 条，含三
  个待定子项（identity 守卫搬不搬 / `internal` 走参数还是挂 kit / `K_EXCHANGE`
  写侧导不导出）与两个实现细节。
- 我指出的一处含义：`ARCHITECTURE.md` 的"两层分离"（模型层 identity / 桥层
  重复派发）与"构造点搬进来"有张力，若要两层合一，那段文档得同步改。

### 2026-10-11

**Exchange 的构造与装配收口**（用户手工重构 + 本 agent 收尾）——

- 构造点搬进 `handleExchange(internal)`：派生 kit → `new
adapter.Exchange(ExchangeKit, internal)` → 读一次 `$I.IDENTITY` 去重 → 写
  `K_EXCHANGE` → attachers → handler pipeline → `finally` 派 `close`。结论并进
  "Exchange 的构造与装配"。
- 连带作废四道守卫（`K_DEPLOYMENT_SELF` 派生、`ExchangeKit !==
DeploymentKit`、`instanceof Exchange.Abstract`、构造后的
  `exchange.server === server`）；`handledExchanges` 的键从实例改成 identity。
  这是**净放宽**，不是收紧。
- `internal` 的形态一并定死：构造参数 → 私有槽 `I.INTERNAL` → 经受保护的
  `$I.IDENTITY` getter 把记录作为**实参**交给 `_I.IDENTITY.GET(internal)`；不给
  validator。
- `Adapter.Registry` 的记录增加必填的 `Exchange` 项（注册期校
  `SubConstructorOf`），新增依赖边 `Adapter → Exchange`（实测无环）。
- **收尾时补的三处硬伤**（重构留下的）：`Exchange/_Symbol.mjs` 少
  `I.INTERNAL` / `I.START_TIMING` / `$I.IDENTITY` 三个键（载入即炸：
  `Cannot set property undefined of #<KittyExchange> which has only a getter`）、
  `Adapter/Registry.mjs` 缺 `Exchange` 项、`handleExchange` 函数表达式缺分号。
- **冻结面收窄**：`Exchange` 基类不再 `Object.freeze(this)`，
  `Request` / `Response` / `Workflow` 仍冻结。不对称是有意的。
- **交付面示例同步**（`test/Adapter.example.mjs`，不执行）：listener 只造
  `internal` 再 `await handleExchange(internal)`；`Exchange` 自己存记录（自有符
  号槽），part 经 `this.exchange` 读；记录带上 `Exchange: Http1Exchange`——因此
  `export default` 必须挪到类声明**之后**（模块求值时读类绑定会踩 TDZ，这是
  lint 的 `no-unused-vars` 报错牵出来的）。
- **探针同步**（`logs/probe-exchange.ign.mjs`）：identity 改为从 `internal` 参数
  取（证明记录真递到了 adapter）、断言 `I.INTERNAL` 持有该记录、断言 Registry
  收下并强制成对的类。全绿。
- **顺带实测**：`isSubConstructor` 严格 → `net.Server` 自己过不了校验，默认值
  不可达（新增第 19 条）。
- **新的悬空点**：listener 不再持有 Exchange，"写回响应"的路由没了着落（第 16
  条）。
- **`K_EXCHANGE` 改为 Exchange 构造期自附**（用户口径：构造后由外部附着"时机过
  于落后，怕类似 `startTiming` 这样的动作有副作用依赖 `ExchangeKit`"）；
  `handleExchange` 里的写入与相应 import 删除。
- **实测出一个结构事实**（写探针断言时撞上的）：`Abstract()` 在
  `Reflect.construct` 之后才包代理，所以 `K_EXCHANGE` 上挂的是**未代理实例**，
  而 `new` 的返回值与 adapter 子类构造器里的 `this` 都是**代理**；`useExchange()`
  因此把未代理对象交给 handler，四个 `_I.*` 的 `.returns()` 校验在 handler 路径上
  不再触发。已记为待定第 20 条（三条收口候选）。
- **顺序纪律**：用户口径"先改善后代码，然后更新文档"——代码先收口，文档后同
  步；倾向不落笔（先记到 DEV）这条已第三次重申。
