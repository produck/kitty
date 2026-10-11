# DEV — 实现笔记与决策日志

> 按**主题**组织，只记**当前有效结论**：代码现在为什么长这样，以及实测到的
> 事实。历史推演不保留（已收敛的并入主题，未收敛的进"暂缓 / 待定"）。代码注释
> 只留 TODO，推演一律落在这里。

## 文档分工

- `ARCHITECTURE.md` / `DESIGN.md` / `ATTACHMENT-PORTS.md` / `DEPLOYMENT.md` /
  `src/Exchange/EXCHANGE.md` 写设计意图与稳定约定，面向"这个包想成为什么"。
- `test/Adapter.example.mjs`——**只读的接口对照物**（不被 `test/index.mjs`
  引用，不执行）。它把 adapter 那一侧的全部 `_I` / `_S` 义务按调用顺序摆在一
  处，并在尾部记下"写它时暴露的设计问题"。改接口时先看它。
- 本文件写实现期事实与取舍，面向"代码现在为什么长这样"。

## 架构基座

### 抽象层：@produck/es-abstract

- 声明面：`Abstract(cls, Abstract({...}), Abstract.Static({...}))`；
  `Member as M` 给契约（`M.Method().args(...).returns(...)`）。
- 抽象实例成员与静态槽都是**访问时惰性校验**，缺实现分别抛
  `Instance member "Symbol(…)" must be implemented in the subclass.` 与
  `Static member "…" must be implemented in the subclass.`。只声明不阻断
  `extends`。
- 契约的 `.returns()` 也在读取时校验（实测：`_I.SOURCE.GET` 答非 `Readable`
  时抛 `TypeError`）。
- **抽象构造器不能直接 `new`**，抛
  `Illegal construction on an abstract constructor.`；下游必须派生。
- **同一份实例有两个面**（实测）：`AbstractConstructor` 在
  `Reflect.construct(target, argumentList, newTarget)` **之后**才
  `new Proxy(instance, instanceProxyHandler)`。于是：
  - 基类构造器体内的 `this`、`part.exchange` 拿到的是**未代理实例**；
  - 派生类构造器体内的 `this`（`super()` 的返回值）与 `new` 的返回值是**代理**。
    所以 adapter 的 Exchange 子类构造器里 `this !== this.request.exchange`，而
    `handleExchange` 里 `new` 出来的代理正是挂到 kit 上的那个（"写侧的
    `exchange`" 一律指代理）。符号槽写在**目标**上，代理对 `this[sym]` 读写照常
    穿透。
- 因此**不用 JS 的 `#` 私有字段**：代理不认私有字段归属，方法里访问
  `this.#x` 会抛。本仓"私有"一律指 `I` 表的符号槽。

### 共享词汇：@produck/argot

- 统一从 argot 取 `Ow` / `ThrowTypeError` / `SYMBOL` / `Unit`；
  `@produck/ow` 与 `@produck/type-error` 不再直接声明（仍作为
  `@produck/es-abstract-*` 的传递依赖留在 lock）。
- `SYMBOL.CONSTRUCTOR` 是本仓捕获 `new.target` 的唯一写法，本地不再声明这个
  键。
- `Ow.throw(x)` 是**抛出实参本身**，不包装：`Ow.throw('…')` 抛的是裸字符串
  （无 `stack`、非 `Error`）。要 `Error` 用 `Ow.Error.Common('…')`。

### Symbol 表约定

- 三级可见性：`I` / `S` 私有，`$I` / `$S` 受保护，`_I` / `_S` 抽象（下游必须
  实现、或必须赋值）。
- 描述符：实例 `.#x` / `.$x` / `._x`；方法与 getter 带括号（`._getMode()`），
  字段不带；静态持类值的键以 `_CTOR` 结尾。
- **空表不建、不导出**：`I` / `$I` / `_I` / `_S` 里一个键都没有，就不写那个
  `export`。
- `_Symbol.mjs` 只定义自己的表，是纯叶子；转发别人的表放 `_Borrow.mjs`，用
  `export * as NAME from '…'` 的命名空间形式。
- 跨包借表：**直接用对方的键**，不另立符号、不做翻译。`Body` 就是这样——它的
  `_S.DISTRIBUTOR_CTOR` 指向 `Fugue.Distributor`，介质槽
  `Fugue.SYMBOL.DISTRIBUTOR._S.DEGRADED_CHUNK_READER_CTOR` 由下游在具体
  Distributor 上赋，本仓不声明也不转发。
- **kit 槽位符号集中在 `Workflow/Capability.mjs`**（`K_WORKFLOW` /
  `K_DEPLOYMENT_SERVER` / `K_EXCHANGE`），描述串统一为 `<Kit>.<slot>`；读面用
  `Kit.Getter` 派生的 `useXxx`。

### 私有槽 + 只读 getter

构造期赋值、之后不变的成员一律写成「类字段 `[I.X] = null` + 构造器里
`this[I.X] = …` + `get x()`」，不用 `this.x = …` 这种可写公有数据属性。已改造：
`Exchange.request` / `response`、`Request.header` / `body`、`Response.header` /
`body`、`Part.exchange`、`Body[I.DISTRIBUTOR]`。

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
- 构造器：`this[I.REQUEST] = new TargetConstructor[_S.REQUEST_CTOR](this)`；
  `this[I.RESPONSE] = new TargetConstructor[_S.RESPONSE_CTOR](this)`。
- 委托 getter：`method` / `mode` / `url` / `statusCode` / `statusText` /
  `setStatus()` / `server` / `protocol` / `httpVersion`；`toJSON()` 抛错。
- 超时守卫读 `this.response.isFinished`（不是 `this.isFinished`——那种写法会恒
  真、无条件 503）。

### Exchange internal：adapter 的连接期上下文

`internal` 是 **adapter 提供的、连接期的业务对象记录**：h1 用 `req` / `res`，
h2 用 `stream` / `req` / `res`，https 再加 TLS 相关对象。

- 记录的**具体形状由 adapter 自己定**，核心一行都不解释——因此也没有
  validator（定不了形状）。代价：adapter 传错东西时，错误发生在它自己的成员实
  现里。
- 差异之大有实例：h1 与 h2 的 header 实现差很多，但那是下游各自实现
  `Header` 的 `_I.GET` / `_I.KEYS` 的事；`internal` 只是**把这些对象递进去的那
  只手**。
- **形态**：构造参数 `constructor(ExchangeKit, internal)` →私有槽 `I.INTERNAL`
  （`Exchange` 的 `I` 表）。受保护读面两个：
  - `get [$I.IDENTITY]()`（在 `Exchange` 上，`$I` 取自 `Exchange/_Symbol.mjs`）：
    把 `this[I.INTERNAL]` 作为**实参**交给 adapter 实现的
    `_I.IDENTITY.GET(internal)`，答案是去重键。
  - `get [$I.INTERNAL]()`（在 **`ExchangePart`** 上，`$I` 取自
    `Part/_Symbol.mjs`）：整条记录。挂在 `ExchangePart` 上，所以六个 subject 全部
    继承——part 的 adapter 子类直接 `this[$I.INTERNAL]` 就能实现自己的成员，不必
    自己安排 `internal` 的存放处（内部实现是读 `this[I.EXCHANGE]` 的
    `I.INTERNAL` 槽，对外只是一条 getter）。
    记录本身仍不由核心解释。用户口径原话："毕竟 `INTERNAL` 无法设置为公有，保护
    级不出 package，所以 adaptor 只能走 exchange 类内的参数传递了。"
    不挂到 kit 上：kit 是核心的部署对象，`internal` 是 adapter 的业务记录，所有权
    与生命周期都不同。
- **它是结构上必需的，不只是"有用"**（实测）：子类字段初始化在 `super()` 返回
  **之后**才跑，基类构造器末尾 `Object.freeze(this)` 会让具体类**存不下自己的
  任何字段**（`Cannot define property field, object is not extensible`）。
  现在冻结面是**有意不对称**的：`Exchange` 基类不冻结（具体 Exchange 能持有自己
  的字段，存 `internal` 就是它的用途），`Request` / `Response` / `Workflow` 仍
  冻结（它们的具体类只能经 `this.exchange` 读）。
- 与 identity 的关系：identity 必须是**每个 exchange 一个的原生对象**（见"术
  语"）；`internal` 正好是"连接期对象"的收纳处，同一片上下文里的两个用途。

### adapter 定义者的交付面

**adapter 定义者必须成套交付：具体 Adapter 类 + 对应的具体 Exchange 类**
（2026-10-10 用户结论）。理由是 `internal` 把两者耦合起来了：Exchange 的
adapter 相关抽象成员靠 `internal` 里的对象实现，而那份记录的形状只有 adapter
自己知道。

- **不止两个类**：adapter 相关抽象成员分散在
  `Exchange` / `Request` / `Response` / `Header`×2 / `Body`×2 七处；Body 还要配
  Distributor 子类与降级介质。缓解这份工作量的手段是**预设组装**，而它在
  `@produck/kitty`，**不在本包**。
- **包边界**：`kitty-workflow` 只定义框架模型、把契约分工做好；默认实现 / 预设
  组装归 `@produck/kitty`。所以"Core 要不要自带一套默认实现"不是本包的待决事
  项。
- **配对已安放**：`Adapter.Registry.registerAdapter()` 的选项有 **`Exchange`**
  （必填），注册期校 `SubConstructorOf(Exchange.Abstract)`，不合法抛
  `ThrowTypeError('options.Exchange', 'sub class of Exchange.Abstract')`；键仍
  是 net.Server 子类。代价是一条依赖边 `Adapter → Exchange`（实测无环：
  `Adapter` 的唯一引用者是 `CompoundWorkflow`，`Exchange/Utils.mjs` 只依赖
  argot）。详见待定第 15 条与第 19 条。
- **`Implement.mjs` 与现架构错位的不只是键名**：它的选项树把 header / body 当
  **函数组**，而现在是独立 subject、经 `_S.HEADER_CTOR` / `_S.BODY_CTOR` 装配，
  那套树里没有对应位置。要重写的是树的形状，它是否还属于本包见待定第 3 条。

### Exchange 的构造与装配

**装配由框架做，adapter 只交一个类和一份记录**：
`CompoundWorkflow.handleExchange(internal)` 是 Exchange 的**唯一构造点**，一次
收口五件事：

1. 派生 `ExchangeKit`（`DeploymentKit('Kitty<Exchange>')`）；
2. `new adapter.Exchange(ExchangeKit, internal)`——类来自 `Adapter.Registry`
   记录的 `Exchange` 项（注册期已校），`internal` 走参数；
3. 读一次 `exchange[$I.IDENTITY]`，用 `handledExchanges`（**按 identity**）拒绝
   重复派发；
4. 写 `ExchangeKit[K_EXCHANGE]`，然后跑 attachers（deployment 级在前、mixin 级
   在后）与 handler pipeline；
5. `finally` 里 `exchange.dispatchEvent(new Event('close'))`。

- **`K_EXCHANGE` 的写侧只有这一处，符号归 Workflow 层**：即 Workflow 抽象层要
  求 `ExchangeKit` 上带着 exchange（见"Symbol 表约定"）。写侧不导出，
  `useExchange()` 是给 handler 的读面；写的是 `new` 出来的**代理**，所以 handler
  拿到的是带 `.returns()` 校验的那一面。
- **校验的落点**：合法性在注册期（`SubConstructorOf`）与 identity 去重处收敛，
  构造期不额外校验 kit 的来历；含义是 `handleExchange` 可以被塞进任意 kit（只要
  它是 kit）。`internal` 也不做任何校验（连"必须是对象"都没有）——符合"不解释
  形状"的本意，见待定第 14 条。
- **顺序确定化是真实收益**：`close` 派发、超时定时器起点、attachers 的相对次序
  不再取决于 adapter 的 listener 怎么写——adapter 只决定"这个事件要不要产生一
  个 exchange"。
- **仍未定**：写回响应的路由（listener 手里没有 exchange），见待定第 16 条。

### ExchangePart

- `Part/_Concrete.mjs` 是**具体**类（不是 `_Abstract`），六个 subject
  （`Request` / `Response` / `Header`×2 / `Body`×2）都从它继承，而它们自己是抽
  象构造函数。子类抽象不违反规范。
- `[I.EXCHANGE]` 私有槽 + `get exchange()`；构造器落
  `this[SYMBOL.CONSTRUCTOR] = new.target`。构造参数**不带默认值**
  （`constructor(exchange)`）：part 一律由框架构造，不存在"没有 exchange 的
  part"这种状态，所以不做 `= null` 兜底（与 `Request` / `Response` / `Body` 一
  致）。受保护的 `get [$I.INTERNAL]()` 见"Exchange internal"。
- **`extends EventTarget`**：所有 part 都是事件目标，事件通道因此有了落点（见待
  定第 13 条）。实测两处容易担心的都不成问题：经 `Abstract` 代理后
  `instanceof EventTarget` 成立；`Request` / `Response` 构造器里的
  `Object.freeze(this)` 不影响 `addEventListener` / `dispatchEvent`（事件挂在内
  部槽，不在属性上）。

### Request / Response

- `_S.{HEADER_CTOR, BODY_CTOR}` → `SubConstructorOf(Header.Abstract)` /
  `SubConstructorOf(Body.Abstract)`。
- `Request.get url()`：先 `new URL(raw)`，绝对 URL 直接成；相对 URL 用
  `this.header.get('host')` 拼 `this.exchange.protocol`，缺 host 抛
  `ThrowAdapter`。
- `Request/Header` 的 `_I.GET` / `_I.KEYS` 是直接符号键（不是 `{ GET: … }`
  嵌套），因为该 subject 只有一个概念。

### Request Body 与 @produck/fugue

- 契约：`_I.SOURCE.GET()` 答 **node `Readable`**（下游交入站流）；
  `_S.DISTRIBUTOR_CTOR` 答 `Fugue.Distributor` 的具体子类。
- `data` = `distributor.fork()`，**每次访问都 fork 一份新的完整拷贝**
  （`body.data !== body.data`）。返回的是 **WHATWG `ReadableStream`**（不再过
  `Readable.fromWeb()`）。转换边界只剩源侧一处：`Readable.toWeb(this[_I.SOURCE.GET]())`。
  契约两侧不同族是有意决定：`data` 交 WHATWG 不算"要收起来的分配器细节"。
- **观测面不做**（2026-10-10 定）：业务 handler 作者只需要 `data`。上了 fugue
  之后不需要在 exchange 生命周期上提供流的可观测性——每个作用域只关心**自己拿
  到的那几份流的状态**，而那是**流实例自身的状态**（`ReadableStream` 的
  `locked` / reader 的 `closed`）。adapter 作者交完源流就退场，同样不需要。
  随之定下：`degraded` / `terminated` / 12 项 `options` / 10 个 warn 码都不进公
  开面；`I.DISTRIBUTOR` **保持私有**，连"升格为 `$I` 给同仓子系统"也否决。
- **源流状态不提供观测**：会与分发语义冲突——消费较慢的那份 fork 还没结束，却
  看见源流已关闭，观感是错的。
- **源流收尾未定**：可能做一个**延迟释放**的决定；"先 `terminate()`"可能是更安
  全的策略——它是**同步门禁**。当前 Body 只建 distributor、只开 `data`。实测对
  照（同一份 body、两份 fork、读完 `a` 的第一块后调用）：
  - `terminate()`——**同步**，返回 `undefined`；只拒绝新的 `fork()`（`Error:
Distributor has been terminated`）；**已发出的副本继续读到各自终点**；源
    不取消；无需吞 rejection。
  - `destroy()`——异步返回 Promise；同样拒绝新 `fork()`；但**会 error 掉已发出
    的副本**，并**取消源**（实测 `readableEnded=false`）；且可能 reject（内部
    `await agent.pullingSettled` 会把源读错重抛），当前没有错误通道（第 13 条）
    只能吞掉。
  - 结论：`terminate()` 严格更安全——结束那一刻只**关门禁**（防结束后继续开新
    副本导致无界增长），把真正的释放（cancel 源 + error 副本 + 释放介质）留给
    更晚的时点。
- `'close'` 是**事实上的契约事件名**：`Exchange` 构造器用它清超时定时器，派发方
  是 `CompoundWorkflow`（`await workflow` 的 `finally` 里）。它没被文档化，语义
  见待定第 16 条。
- **事件通道是另一条线**：把 distributor 的信号引到 exchange 体系、让 handler
  用户针对事件做动作（如写日志），见待定第 13 条。两件事不矛盾：一条关的是"不
  开状态 getter"，另一条关的是"事件有没有通道"。
- **不自己定义 Distributor 层**：Body 只认"整个具体 Distributor"，介质契约回到
  fugue 自己的公开面（`_S.DISTRIBUTOR_CTOR` + fugue 的介质槽）。
- **源流必须是字节流（`objectMode: false`）**。实测 objectMode 源会让 fugue 的降
  级探针在第一次 pull 就误判越限，随后去读介质槽并抛
  `Static member "._transferrerCtor" must be implemented`。http1.1 / http2 的入
  站流本来就是字节流，不会踩。
- **包内还没有降级介质的实现**（`Fugue.DegradedChunkReader` 家族 +
  `Transferrer`）。

### Workflow / CompoundWorkflow

- `Workflow/_Abstract.mjs` 的抽象面只有 `_I.COMPOSE.EXTEND` 与
  `_I.COMPILE_ARTIFACT`。
- `Workflow` 构造器把自己的 Exchange 配置装到自己的 kit 上：
  `Exchange.Configuration.install(WorkflowKit, this)`。
- `[$I.COMPILE](server, DeploymentKit = this[$I.KIT]('Kitty<Deployment>'))` 写
  `DeploymentKit[K_DEPLOYMENT_SERVER] = server`。
- `get isFinalized()` 就是 `Object.isFrozen(this)`，没有单独布尔位。
- `CompoundWorkflow/_Borrow.mjs` 以
  `export * as WORKFLOW from '../Workflow/_Symbol.mjs'` 转发；这是本仓唯一还需要
  `_Borrow.mjs` 的地方。

### 依赖治理

`packages/workflow/package.json` 的依赖共 9 条：`@produck/argot`、
`@produck/compose`、`@produck/deep-freeze-enumerable`、`@produck/es-abstract`、
`@produck/es-abstract-member-constructor`、`@produck/fugue`、
`@produck/is-sub-constructor`、`@produck/kit`、`is-plain-object`。

## 术语

- **subject**（主题目录）＝一个类一个目录：`_Abstract.mjs` 或 `_Concrete.mjs`
  （存在性互斥）+ `index.mjs` + `_Symbol.mjs`（借表时多一个 `_Borrow.mjs`）。
  目录路径即其符号命名空间。
- **`Parser.mjs` 也跟着 subject 分区**（2026-10-11）：校验词汇归它的 subject。
  `Request/Parser.mjs` 持有 `HttpMethod` / `ExchangeMode`（前者原本在共享的
  `Exchange/Parser.mjs` 里），`Request/index.mjs` 里 `export * as Parser`；共享
  的那份只剩跨界词汇（HTTP 版本、状态码、协议、header 名/值、`Iterable`、配置用
  的整数校验）与 `HttpMethodList`。`HttpMethodList` 留在 Exchange 侧但**从
  `Request/Parser.mjs` 引 `HttpMethod`**——于是多了一条"Exchange 级模块依赖
  Request 级"的边，与 `Exchange/_Abstract.mjs` 引 `Request/index.mjs` 同向，可
  以接受。
- **part** ＝ `ExchangePart` 家族的实例（Request / Response / Header / Body 以及
  后续成员）。
- **slot**（槽位）＝ `_S` 里的一个键，值是一个类引用，语义是"下游必须在这里挂上
  具体实现"。
- **fork** ＝ 从 `Fugue.Distributor` 取一份新的、从第 0 字节起的完整拷贝。
- `done`（数据到头）· `closed`（读取器/流被生命周期关闭）· `destroyed`（分发器
  销毁）——三个词不混用。
- **internal** ＝ adapter 提供的**连接期业务对象记录**（h1 的 req / res、h2 的
  stream / req / res、https 的 TLS 相关对象……）。形状由 adapter 定，核心不解
  释；它是 adapter 把上下文接进 Exchange 契约的那只手。
- **identity** ＝ adapter 从协议运行时里**挑**出的、每个 exchange 一个的原生对
  象（h1 用 `req`、h2 用 `stream`；**不用 `socket`**，那是连接期的），用于
  identity–exchange 强绑定去重。

## 暂缓 / 待定

> 编号是**引用锚点**：已定的条目直接删除、不重排，所以会出现跳号。

1. **规范草案（`code-style/…/partial-constructor/README.md`）待修订**
   - `_Borrow.mjs` 该不该规定转发形状（现在只有 `export * as` 的惯例）；
   - BTB-1 用词是 "borrowed table"，但 `_A` 在本仓永远为空，实际转发的是"源
     模块的符号命名空间"；
   - 空表不构造/不导出——需要写明表清单是白名单而非必填集；
   - ABS-1 的 "expected to derive from" 是否覆盖**包内家族基类**
     （`ExchangePart` 是具体类却被六个 subject 继承）；
   - LAY-7（派生必须是抽象基类目录的**兄弟**）与 LAY-8（嵌套）在共享具体基类下
     互相打架；
   - `20-produck-commit.instructions.md` 的 "Workspace Draft Files" 举例给了
     `message.draft.ignore`，它并不匹配自己要求的 `*.ign*`。
2. **PUB-2 未做**：`src/index.mjs` 只导出 `Workflow`，尚未把 Workflow 的抽象成
   员符号（`_I.COMPOSE.EXTEND` / `_I.COMPILE_ARTIFACT`）按 PUB-3 以"选择"的形式
   开出去。参考实现的做法是包出口带 `SYMBOL.<模块>.<表>.<键>`，并直接暴露抽象
   subject 供下游 `extends`。
3. **`Exchange/Implement.mjs` 未接线，且归属存疑**：`Exchange/index.mjs` 已不再
   导出它（否则整包在载入期就炸）。**要重写的是选项树的形状**（见"adapter 定义
   者的交付面"）。另："用函数树生成具体类"这种工厂算**框架模型**（留本包）还是
   算**预设组装**（搬到 `@produck/kitty`），未定。用户口径："先把所有 subject
   的结构搞清楚"。
4. **（已定，见"Exchange 的构造与装配"）**
5. **Body 与 `config` 的关系未定**：`Exchange/Config.mjs` 已有 `maxBodySize` /
   `maxRequestBodyBuffer` / `allowedBodyMethods`，一个都还没接到 fugue 上。要定
   `maxBodySize` 对应 fugue 的哪一档（`MaxChunkStashByteLength`？还是硬上限 +
   413）。
6. **默认降级介质由谁提供未定**：包内没有 `Fugue.DegradedChunkReader` 的实现
   （内存或临时文件）。按"不组装介质"的定调它不在 Body 层，但放在哪一级、要不
   要出，未定。
7. **`data` 是否改为缓存首次 fork 未定**：现在是每次访问新 fork。
8. **`Workflow/_Abstract.mjs` 两处 `Ow.throw('…')` 抛裸字符串**
   （`$I.ASSERT.FINALIZED` / `$I.ASSERT.NOT_FINALIZED`），同文件其它地方用的是
   `Ow.Error.Common`。要不要统一，未定。
9. **文档过时**：`ARCHITECTURE.md` 的公开 API 表与 Request 成员树、`DESIGN.md`
   的若干表、`src/Exchange/EXCHANGE.md` 仍列着本包不存在的成员或未落地的“计划”
   段落（`Exchange.Implement()` 那段同属此列）。
10. **`test/*.mjs` 是重构前的骨架**：仍 import `../src/Symbol.mjs` /
    `../src/Abstract.mjs`，并引用已不存在的 `Adapter.Registry.define` 等 API。
    `test/Transaction.test.mjs` 是空的，且已不被 `test/index.mjs` 引入。按
    `DESIGN.md` 这属于"设计沙盒"，暂未处理。
11. **Adapter / handler / kitty 三个域尚无代码**：10 个占位 workspace 只有
    `package.json`；`AdapterKit.*` 与 `Adapter.Registry.registerAdapter` 全仓零
    调用点。
12. **何时对 distributor 进行配置未定**：fugue 的选项是**逐实例**的
    （`Options.Tune` / `Options.Get`，`Preset` 只是若干 `Tune` 的打包），默认值
    来自它自己的 `Items.mjs`，安装点就在 `Distributor` 构造器里。而我们把
    distributor 建在 `Body` 构造器里、随后锁进私有槽 `[I.DISTRIBUTOR]`，没有公
    开 getter——于是**目前没有任何时刻/入口能对它配置**。拆成三个子问题：
    (a) **谁配**——`Body` 把 `Exchange/Config.mjs` 的 `maxBodySize` 等翻译过去，
    还是下游在具体 Distributor 子类里自己 `Tune`；(b) **何时配**——fugue 每项选
    项的**读取时机不同**，配晚了等于没配：`MaxChunkStashByteLength` /
    `DegradeOnChunkStashFullAndDone` 每趟 pull 都读，随时可调；
    `ForkedReadableStreamHighWaterMark` 每次 fork 读一次（第一份拷贝出去就固
    化）；读器/写器那几对重试预算分别在各自的 initialize / dump / drain 时读一
    次；(c) **入口形态**——加公开 `get distributor()`、加一个构造期回调的 `_I`
    钩子，还是干脆全交给下游的 Distributor 子类构造器。
13. **distributor 的观测怎么导到 exchange 体系上，未定**（2026-10-10 记）：应该
    有个地方把 distributor 的信号（`fork` / `degrade` / `terminate` / `warn`）
    转发 / 代理进 exchange 体系，好让 handler 用户可以**针对事件**决定动作，比
    如写日志。**实现责任归属没想好**，候选：
    - `ExchangePart extends EventTarget` 已定，所以候选之间的差别不再是"能不能
      挂事件"，而是**转发/代理的责任落在哪一层**；
    - `Body`——它持有 distributor，自己就是 `EventTarget`，最直接；
    - `Exchange`——它也是 `EventTarget`，又是 handler 拿到的对象；
    - `CompoundWorkflow` 的 **runtime exchange attacher**——机制已在
      （`I.MIXIN.EXCHANGE.ATTACHER.LIST`，exchange 经 `handleExchange` 到达时按
      序执行），不必新造概念；
    - `adapter`——它交出源流后就退场，最不像。
    - 连带要定：转发哪几种事件；warn 的 10 个 code 折不折叠；事件名用 fugue 的
      词还是 kitty 的词（与"不让用户理解分配器细节"直接冲突）；listener 抛错怎
      么办（是否污染 fugue 自己的派发）；订阅时机与解除（handler 在 `use()` 时？
      执行时？）。
14. **`handleExchange` 对 `internal` 的守卫强度未定**：现状是**完全不校验**（连
    "必须是对象"都没有）。符合"不解释形状"的本意，还是入口该补一句极浅的检查？
15. **（已定，见"adapter 定义者的交付面"）**
16. **`'close'` 的语义与契约化未定**：它现在只有一个消费者（`Exchange` 清超时
    定时器），派发方却是 `CompoundWorkflow` 在 `await workflow` 的 `finally`
    里——一个字符串撑起了跨模块约定，但从未写进任何契约。要定的是：它算**公开契
    约**还是内部约定；语义是"**workflow 调用结束**"还是"**exchange 生命周期结
    束**"（两者不等价）；**关闭时到底做什么**（`terminate()` 同步门禁 /
    `destroy()` 立即释放 / 延迟释放，见"Request Body 与 @produck/fugue"的对照）；
    以及将来要不要换成符号 / 常量、要不要带上关闭原因。
    - **写回响应的路由也没着落**：构造点搬进 `handleExchange` 后，listener 手里
      不再有 Exchange（`handleExchange` 不返回它）——"把响应写回 socket"这一步
      悬空。三条候选：①`handleExchange` 返回 exchange，listener 照旧
      `respond(exchange, res)`；②具体 Exchange 在自己的构造器里订阅 `close` 时
      写回（例子现在就是这么写的，标了 `[pending 16]`）；③让 attacher 或一个专
      用 hook 承担写回。用户定之前，`test/Adapter.example.mjs` 只是"按现码能跑
      通"的一种写法。
17. **（已定，见"Exchange 的构造与装配"）**
18. **header `_I.GET` 的契约与实现不符**（2026-10-11 写例子时发现）：`Request`
    与 `Response` 的 Header subject 都把 `_I.GET` 声明为 `.returns(M.String)`，
    但 `has()` 与 `Request.get url()` 都靠 `undefined` 判"这个 header 不存
    在"，而契约会用 `Invalid "member", one "string" expected.` 拦下 `undefined`
    （实测）。另外 `res.getHeader()` 还可能答 number 或数组，同样违约。难点：
    `returns()` 只收**一个** parser、method member 是**一次性**的（不能再
    `.returns()` 第二次），而 Member 词表（`Any` / `String` / `Undefined` /
    `OrPromise`…）里没有并集或可选组合子——所以要自己写一个 parser（例如
    `Optional(M.String)`，与 `OrPromise(parser)` 同形）。
19. **`Adapter.Registry` 的 `constructor` 默认值不可达**（实测）：`isSubConstructor`
    是**严格**的——`isSubConstructor(net.Server, net.Server)` 为 `false`。而
    `normalizeOptions` 的默认值正是 `net.Server`，于是**省略 `constructor` 必然
    抛** `Invalid "options.constructor", …`：默认值是死代码，而"必填"这件事没写
    在任何地方。两种收口：①删掉默认值、明记必填；②改成
    `X === net.Server || isSubConstructor(X, net.Server)`，让默认值名副其实。倾
    向②。未定。
20. **（已并入"抽象层：@produck/es-abstract"的"两个面"）**
21. **在 kit 上读一个不存在的符号属性会抛出莫名的 `TypeError`**（实测）：
    `@produck/kit` 的依赖代理在 `get` 陷阱里拼
    `Dependence "${property}" is undefined.`，而 `property` 是 **Symbol** 时模板
    字符串转换先炸：`TypeError: Cannot convert a Symbol value to a string`。于
    是"`ExchangeKit` 上还没有 exchange"这种最常见的缺槽情形，报出来的不是缺少依
    赖，而是这句无关的话（实测对象是 `Kit.global` 的直接读；`Kit.Getter(K).use`
    是否同路径未逐项验证）。要定的：①`useExchange` 读不到时自己先抛一句人话
    （例如 "ExchangeKit carries no exchange."）；②把代理里的拼字符串问题报到
    `@produck/kit`（模板里 `String(property)`）。倾向①——本包能自保。

## 决策日志（演进 · 按时间追加）

> 未收敛的决策按 `YYYY-MM-DD` 追加；收敛后并入上方主题并从此处删除。
