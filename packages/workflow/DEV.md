# DEV — 实现笔记与决策日志

> 按**主题**组织，只记**当前有效结论**：代码现在为什么长这样，以及实测到的事实。
> 历史推演不保留（已收敛的并入主题，未收敛的进"暂缓 / 待定"）。代码注释只留
> TODO。

## 文档分工

- `ARCHITECTURE.md` / `DESIGN.md` / `ATTACHMENT-PORTS.md` / `DEPLOYMENT.md` /
  `src/Exchange/EXCHANGE.md`：设计意图与稳定约定，面向"这个包想成为什么"。
- `test/Adapter.example.mjs`：**只读的接口对照物**（不被引用、不执行），把 adapter
  侧的全部 `_I` / `_S` 义务按调用顺序摆在一处；改接口时先看它。
- 本文件：实现期事实与取舍，面向"代码现在为什么长这样"。

## 架构基座

### 抽象层：@produck/es-abstract

- 声明面 `Abstract(cls, Abstract({...}), Abstract.Static({...}))`，契约用
  `Member as M`（`M.Method().args(...).returns(...)`）。
- 实例成员、静态槽、`.returns()` 全是**访问时惰性校验**：缺实现分别抛
  `Instance member "Symbol(…)" must be implemented.` /
  `Static member "…" must be implemented.`（只声明不阻断 `extends`）；
  `_I.SOURCE.GET` 答非 `Readable` 时抛 `TypeError`（实测）。抽象构造器**不能直接
  `new`**（`Illegal construction on an abstract constructor.`）。声明了
  `Abstract.Static({…})` 的类，其派生类**必须经 `SubConstructorProxy` 构造**，
  否则构造期抛 `It MUST SubConstructorProxy("<name>").`（实测，0.4.x 起）。
- **构造体内的 `this` 是生实例，其余都是面**（实测）：代理在
  `Reflect.construct(...)` **之后**才建，所以被包的那个类的构造体里 `this`（以及它
  祖先构造体里的 `this`）是**未代理实例**；派生类构造体里的 `this`（`super()` 的
  返回值）与 `new` 的返回值是**代理**。因此凡是要把自己或别人交出去的地方都取面：
  Exchange 用 `$(this)` 建两个 part、并用 `$(this)` 把自己挂上 kit，part 拿到的于
  是就是面（`exchange.request.exchange === exchange`，实测）。符号槽写在**目标**
  上，代理对 `this[sym]` 读写照常穿透。
- **要把"面"从构造体里交出去，用 `ShadowThis as $`**（`$(this)`）：层按实例缓存
  （`Instance.proxyOf` 存 WeakMap），所以 `$(this)` 与包装层最后返回的是**同一个
  对象**；传入已是面时原样返回，传入非抽象类实例则抛 `ShadowThis() requires an
instance of an abstract class.`。于是"构造体内登记自己"不再等于把生实例交出去
  ——两处需要（`K_WORKFLOW` / `K_EXCHANGE`）的都是这么做的。
- 因此**不用 JS 的 `#` 私有字段**（代理不认私有字段归属，`this.#x` 会抛）：本仓
  "私有"一律指 `I` 表的符号槽。

### 共享词汇：@produck/argot

- 统一从 argot 取 `Ow` / `ThrowTypeError` / `SYMBOL` / `Unit`；`@produck/ow` 与
  `@produck/type-error` 不再直接声明（仍是 `@produck/es-abstract-*` 的传递依赖）。
- `SYMBOL.CONSTRUCTOR` 是本仓捕获 `new.target` 的唯一写法，本地不再声明这个键。
- `Ow.throw(x)` **抛实参本身**：`Ow.throw('…')` 抛裸字符串（无 `stack`、非
  `Error`）；要 `Error` 用 `Ow.Error.Common('…')`。

### 附着与查找：@produck/kit

- kit = 自身 `dependencies`（`Object.create(null)`）+ 父指针，子 kit 由
  `Kit(childName)` 派生。读：先查自身，否则**实时沿父链**（`KitProxy.mjs` 的 `get`
  → `parent[property]`）——不是快照，所以附在上游的值，下游（含更早创建的 kit）当
  场就读得到。
- 写：自身已有该键就抛 `Dependence "X" exists.`（**同层不可改写**）；`delete` /
  `has` / `ownKeys` 一律抛（不可删、不可枚举）。读不到时沿链到顶抛
  `ReferenceError: Dependence "X" is undefined.`，所以"允许缺失"用
  `Kit.Getter(name).touch(kit)`（返回 `undefined`）；属性是 Symbol 时这条拼字符串
  本身会先抛（实测，见第 21 条）。
- 能力 = `K_*` 键 + `use*` getter（集中在 `src/Capability.mjs`，见"Symbol 表
  约定"）。部署级写入口 `AdapterKit.attachDeployment(name, value)`
  带 `assertNotCompiled()` 闸门：**编译后关闭**。
- **层级即可见域**：`AdapterKit` 与 `ExchangeKit` 都是 `DeploymentKit` 的**兄弟**
  （`DeploymentKit('Kitty<…>')`），互看不到对方自表的键；读只向上，所以"只让某些
  面能改"就等于"把写入口挂在那些面／那一级"。
- 推论：**可变性不会顺带得到**。要可变只能三者之一，且都要作者显式实现——①附着对
  象自身可变；②在更深（每次新建）的 kit 上写、遮蔽父值；③状态留浅面、写权限经深
  面透出。这是模式提供的保护：要求使用者明确定义可变性如何实现。

### Symbol 表约定

- 三级可见性：`I` / `S` 私有，`$I` / `$S` 受保护（同一 package 内可读），`_I` /
  `_S` 抽象（下游必须实现或赋值）。描述符：实例 `.#x` / `.$x` / `._x`；方法与
  getter 带括号（`._getMode()`），字段不带；静态持类值的键以 `_CTOR` 结尾。
- **空表不建、不导出**：一个键都没有就不写那个 `export`。
- `_Symbol.mjs` 只定义自己的表、是纯叶子；转发别人的表放 `_Borrow.mjs`，用
  `export * as NAME from '…'`（大写模块名，与 `import * as Part` 那种**出口**导入
  区分）；`_A` 永为空（第 1 条）。
- **借用一律走本模块自己的 `_Borrow.mjs`**（BTB-2 / BTB-3 / BTB-6）。现状：
  `CompoundWorkflow` 借 `Workflow` 与 `Exchange`；`Exchange/Part` **向上**借
  `Exchange` 的 `I` 表（只为读 `I.INTERNAL` 槽）；`Exchange` 借六个 subject 的表
  （`Implement/` 要用它们的 `_I` / `_S`）；六个 subject 借 `Part` 的 `$I` 表（取
  `$I.INTERNAL` 传给抽象成员）。
- 跨包借表**直接用对方的键**，不另立符号、不做翻译：`Body` 的
  `_S.DISTRIBUTOR_CTOR` 指向 `Fugue.Distributor`（2026-10-14：该键已删，Body 的介质类
  改由 Workflow 的 `$I.STATE.ReadableStreamDistributor` 提供），介质槽
  `Fugue.SYMBOL.DISTRIBUTOR._S.DEGRADED_CHUNK_READER_CTOR` 由下游在具体
  Distributor 上赋，本仓不声明也不转发。
- **kit 槽位符号集中在 `src/Capability.mjs`**（`K_WORKFLOW` /
  `K_DEPLOYMENT_SERVER` / `K_EXCHANGE`），描述串统一 `<Kit>.<slot>`；读面用
  `Kit.Getter` 派生的 `useXxx`。用户口径：**这类定义跟"端口"走，不跟 subject
  走**——能力符号描述的是 kit 层级（端口），与某个 subject 的成员表无关，所以它
  不在任何 subject 目录下、也不挂在任何 subject export 上（`Workflow/index.mjs`
  不再出口 `Capability`），用方直接 `import` 该模块。

### 私有槽 + 只读 getter

构造期赋值、之后不变的成员一律写成「类字段 `[I.X] = null` + 构造器里
`this[I.X] = …` + `get x()`」，不用 `this.x = …` 这种可写公有数据属性。已改造：
`Exchange.request` / `response`、`Request.header` / `body`、`Response.header` /
`body`、`Part.exchange`、`Body[I.DISTRIBUTOR]`。

判据是"**只读**"，不是"要不要暴露"：下游会读的（`request` / `response` /
`header` / `body` / `exchange`）配 getter，纯内部的（`Body` 的 distributor、
`$I.KIT` 等受保护槽）只有槽、没有 getter。

### 命名

- `new.target` 捕获的局部一律叫 `TargetConstructor`；`ctor` 这个缩写**只**留给符号
  键（`_S.REQUEST_CTOR` 等）。
- 具体基类不加 `Abstract` 前缀（`ExchangePart`）；`_Abstract.mjs` 里的类名加
  （`AbstractRequest`、`AbstractRequestBody`、`AbstractResponse`）。

## 观点 / 决策 / 结论

### Exchange 不再是成员总线

抽象成员下放到各自的 ExchangePart，Exchange 只留自己的四项（`IDENTITY` /
`SERVER` / `SERVER.PROTOCOL` / `HTTP_VERSION`）与两个静态槽。

- `_S.REQUEST_CTOR` / `_S.RESPONSE_CTOR`：分别收紧到
  `SubConstructorOf(Request.Abstract)` / `SubConstructorOf(Response.Abstract)`，
  下游赋具体类；构造器里 `new TargetConstructor[_S.REQUEST_CTOR](this)`（Response
  对称）。
- 委托 getter：`method` / `mode` / `url` / `statusCode` / `statusText` /
  `setStatus()` / `server` / `protocol` / `httpVersion`；`toJSON()` 抛错。
- 超时守卫读 `this.response.isFinished`（不是 `this.isFinished`——那种写法会恒真、
  无条件 503）。

### Exchange internal：adapter 的连接期上下文

`internal` 是 **adapter 提供的、连接期的业务对象记录**：h1 用 `req` / `res`，h2 用
`stream` / `req` / `res`，https 再加 TLS 相关对象。

- 记录的**形状由 adapter 自己定**，核心一行都不解释——因此也没有 validator（定不
  了形状）。代价：adapter 传错东西时，错误发生在它自己的成员实现里。h1 与 h2 的
  header 差异很大，但那是下游各自实现 `Header` 的 `_I.GET` / `_I.KEYS` 的事；
  `internal` 只是**把这些对象递进去的那只手**。
- **形态**：`constructor(ExchangeKit, internal)` → 私有槽 `I.INTERNAL`（`Exchange`
  的 `I` 表）。受保护读面两个——`get [$I.IDENTITY]()`（在 `Exchange` 上）把记录作
  为**实参**交给 adapter 实现的 `_I.IDENTITY.GET(internal)`，答案是去重键；
  `get [$I.INTERNAL]()`（在 **`ExchangePart`** 上，`$I` 取自 `Part/_Symbol.mjs`）
  给出整条记录，六个 subject 全部继承，基类调用抽象成员时靠它把记录取出来传给下
  游。用户口径原话："毕竟 `INTERNAL` 无法设置为公有，保护级不出 package，所以
  adaptor 只能走 exchange 类内的参数传递了。" **不挂到 kit 上**：kit 是核心的部署
  对象，`internal` 是 adapter 的业务记录，所有权与生命周期都不同。
- **记录怎么到下游：抽象成员的第一个实参就是它**（2026-10-11 定）：Part 调 `_I` 成
  员一律传 `this[PART.$I.INTERNAL]`（六个 subject 共 16 处），Exchange 自己的四个
  成员全部传 `this[I.INTERNAL]`（于是 adapter 的 Exchange 子类不需要任何自有槽）。
  成员声明把首参声明为 `M.Any`（形状由 adapter 定，写不出更具体的 parser）；
  `IDENTITY.GET` 仍是 `.args().rest(M.Any)`（允许任意尾参），其余一律 `.args(M.Any)`。
  实现类形如 `[_I.METHOD.GET](internal) { return internal.request.method; }`——不必
  自备存放处、也不用到 `$I`；用不到记录的实现少声明参数即可（声明之外走 `rest`，
  不校验）。
- **冻结面落在具体实现点自己身上**（2026-10-11 定）：子类字段初始化在 `super()` 返
  回**之后**才跑，所以基类构造器末尾若 `Object.freeze(this)`，具体类就**存不下自己
  的任何字段**（实测报 `Cannot define property …optionsContext…, object is not
extensible`）。现在七个具体类都重载 `constructor`，参数以 `(...args)` 原样转发给
  `super(...args)`（用户口径：这样写是为**暗示行为上是"纯粹代理"**——自己不动参
  数），随后 `Object.freeze(this)`；顺序正好是"上下文字段先装上、再冻"。基类
  （`Request` / `Response` / `Exchange`）都不再自冻；`Workflow` 仍自冻。实测：冻结
  后的实例照旧能 `addEventListener` / `dispatchEvent`（监听不走实例属性），而任何
  "构造后往实例加字段"都会抛 `TypeError`；装配路径只读 `exchange[$I.IDENTITY]`、把
  exchange 写进 **kit**、再 `dispatchEvent`，没有对实例的后续写入。
- 与 identity 的关系：identity 必须是**每个 exchange 一个的原生对象**（见"术
  语"）；`internal` 正好是"连接期对象"的收纳处，同一片上下文里的两个用途。

### adapter 定义者的交付面

**adapter 定义者必须成套交付：具体 Adapter 类 + 对应的具体 Exchange 类**
（2026-10-10 用户结论）：adapter 相关的抽象成员靠 `internal` 里的对象实现，而那份
记录的形状只有 adapter 自己知道。

- **不止两个类**：这些成员分散在 `Exchange` / `Request` / `Response` / `Header`×2 /
  `Body`×2 七处，Body 还要配 Distributor 子类与降级介质。缓解手段是**预设组装**，
  它在 `@produck/kitty`，**不在本包**——`kitty-workflow` 只定义框架模型、把契约分工
  做好。"Core 要不要自带一套默认实现"不是本包的待决事项。
- **配对已安放**：`Adapter.Registry.registerAdapter()` 的选项有 **`Exchange`**
  （必填），注册期校 `SubConstructorOf(Exchange.Abstract)`，不合法抛
  `ThrowTypeError('options.Exchange', 'sub class of Exchange.Abstract')`；键仍是
  net.Server 子类。代价是一条依赖边 `Adapter → Exchange`（实测无环：`Adapter` 的唯
  一引用者是 `CompoundWorkflow`，`Exchange/Utils.mjs` 只依赖 argot）。见第 19 条。
- **`Implement/`（2026-10-11 落地，同日拆成目录）**：入参是"扁平普通对象 + 函数"，
  保留原版的具名结构（用户口径），叶子按 subject 分组：
  `identity.get`；`server.{get,protocol.get}`；`httpVersion.get`；
  `request.{mode,method,URL}.get`、`request.header.{get,keys}`、
  `request.body.{source.get}`；`response.status.{get,set}`、
  `response.statusText.{get,set}`、`response.finished.is`、
  `response.header.{get,keys,set,delete}`、`response.body.data.{get,set}`。
  `index.mjs` 只留装配（七个 `Implemented*` + `SCP` 表 + `return`），选项校验拆到
  `Normalize.mjs`（导出 `normalize()`）。该目录无 `_Abstract.mjs` /
  `_Concrete.mjs`，按 LAY-5 是**非 subject 元素**、不受 `_Symbol.mjs` /
  `_Borrow.mjs` 约束，照旧用 Exchange 自己的表。
- **七个具体类全在 `Implement` 闭包内、全部过 `SCP`**（用户口径"所有子类都应该
  SCP"）：只 `return` 第 1 个给下游注册，其余六个经 `_S` 静态槽互指。于是**下游一
  个类都不用写**，构造器漏洞在这七处都无从出现（早前讨论的 `Reflect.construct` 绕
  过手段对本包 subject 不再需要）。
- **树在 `Implement` 里一次性全解构，拆到纯函数**（用户口径"t 都解构"→"拆至纯函数
  水平"）：`normalize` 的返回值不留载体，叶子函数直接绑成局部名
  （`request.mode.get` → `getRequestMode`、`response.body.data.set` →
  `setResponseBodyData` …），组那一层一个都不落地；命名按叶子语义加域前缀（取用
  `get*` / 变更 `set*` / 布尔 `is*` / 删除 `delete*`），唯一的非函数叶子
  `distributorCtor` 保持原名（2026-10-14：该叶子已删，树里不再有非函数叶子）。
- **每个实现点自带一份冻结的 options 上下文**（用户口径"所有实现点都增加一个面向
  options 的上下文冻结对象"）：私有槽 `[I_OPTIONS_CONTEXT]` =
  `Object.freeze({ self, internal })`——`self` 是该实现点自身（实测**就是**消费者手
  里那个对象：`super()` 返回的已是 proxy，字段初始化时 `this` 即它），`internal`
  是它要服务的记录（part 取 `PART.$I.INTERNAL`，Exchange 取
  `EXCHANGE.I.INTERNAL`）。
- **树函数的首参就是这个上下文**：要记录读 `ctx.internal`、要实例读 `ctx.self`；成
  员自己的 `internal` 形参因此空置（写作 `_internal`）。比"记录 + `this` 两个通
  道"稳：交付物有名字、被冻结、不受调用方是否用 `.call` 影响。代价：`ctx.self` 不
  是死数据，作者可以绕回自己（`ctx.self.request.header.get(…)`）形成回环、不报错
  只是重复跑树——立为禁忌。`distributorCtor` 是类（值），不走上下文（2026-10-14：该叶子已删）。
- **校验照原版写法：显式逐层块，无形状表、不碰符号表**（用户口径）：逐层
  `isPlainObject` 判到组、`typeof === 'function'` 判到叶子，报错路径是字面量
  （`args[0].request.header.get` / `args[0].response.body` …）。旧树的 `meta` 在新
  契约里既无成员也无静态槽 → 按**删除**处理；多余的键**不再被拒**（只读它认识的
  键，其余忽略），遗留键传进来静默无效。`distributorCtor` 是**必填**（2026-10-14：
  该格随树一起删除，下面的必填与包装要求随之失效），而且 0.4.x
  起这一格**必须是被 `SubConstructorProxy` 包装过的类**（层要求"声明了静态抽象成员
  的类，其派生类必须经包装构造"，裸类在 body 构造期抛
  `It MUST SubConstructorProxy("Distributor").`——实测）；如何收口见第 22
  条。
- **实现细节**：声明 `.returns(M.Undefined)` 的四个成员（`STATUS.SET` /
  `STATUS_TEXT.SET` / `ResponseHeader.SET` / `.DELETE`）**不转发**树函数的返回
  值，否则会把 `Map#set` 之类漏出去、被契约拦下。
- **残留风险（已知）**：①`_I` 新增成员时，没有任何东西提醒树／成员体还没接上；
  ②成员体里绑错变量拦不住（两个名字都在作用域里，写错不报错）；③多余键静默忽略。

### Exchange 的构造与装配

**装配由框架做，adapter 只交一个类和一份记录**：
`CompoundWorkflow.handleExchange(internal)` 是 Exchange 的**唯一构造点**，一次收口
四件事：①派生 `ExchangeKit`（`DeploymentKit('Kitty<Exchange>')`）；②
`new adapter.Exchange(ExchangeKit, internal)`——类来自 `Adapter.Registry` 记录的
`Exchange` 项（注册期已校）、`internal` 走参数，而**构造器末尾自己把面挂上 kit**
（`ExchangeKit[K_EXCHANGE] = $(this)`）；③读一次 `exchange[$I.IDENTITY]`，用
`handledExchanges`（**按 identity**）拒绝重复派发；④跑 attachers（deployment 级在
前、mixin 级在后）与 handler pipeline，`finally` 里
`exchange.dispatchEvent(new Event('close'))`。

- **`K_EXCHANGE` 的写侧只有一处，在 `KittyExchange` 的构造器里**（符号在
  `src/Capability.mjs`）：写的是 `$(this)` 取出的**面**，所以 handler 拿到的是带
  `.returns()` 校验的那一面；写侧不导出，`useExchange()` 是给 handler 的读面。
  连带一条约束：**交给构造器的 kit 必须每 exchange 一份**（kit 的 `set` 拒绝同层
  二次写入），框架里由 `DeploymentKit('Kitty<Exchange>')` 保证。
- **校验的落点**：合法性在注册期（`SubConstructorOf`）与 identity 去重处收敛；构造
  期不额外校验 kit 的来历（`handleExchange` 可以被塞进任意 kit，只要它是 kit），
  `internal` 也不校验（连"必须是对象"都没有）——符合"不解释形状"的本意，见第 14
  条。
- **顺序确定化是真实收益**：`close` 派发、超时定时器起点、attachers 的相对次序不再
  取决于 adapter 的 listener 怎么写——adapter 只决定"这个事件要不要产生一个
  exchange"。**仍未定**：写回响应的路由（listener 手里没有 exchange），见第 16 条。

### ExchangePart

- `Part/_Concrete.mjs` 是**具体**类（不是 `_Abstract`），六个 subject（`Request` /
  `Response` / `Header`×2 / `Body`×2）都从它继承，而它们自己是抽象构造函数；子类抽
  象不违反规范。
- `[I.EXCHANGE]` 私有槽 + `get exchange()`；构造器落
  `this[SYMBOL.CONSTRUCTOR] = new.target`。构造参数**不带默认值**
  （`constructor(exchange)`）：part 一律由框架构造，不存在"没有 exchange 的 part"
  这种状态（与 `Request` / `Response` / `Body` 一致）。
- **`extends EventTarget`**：所有 part 都是事件目标，事件通道因此有落点（见第 13
  条）。实测两处不必担心：经 `Abstract` 代理后 `instanceof EventTarget` 成立；构造
  器里的冻结不影响 `addEventListener` / `dispatchEvent`（事件挂内部槽，不在属性
  上）。

### Request / Response

- `_S.{HEADER_CTOR, BODY_CTOR}` → `SubConstructorOf(Header.Abstract)` /
  `SubConstructorOf(Body.Abstract)`。
- `Request.get url()`：先 `new URL(raw)`，绝对 URL 直接成；相对 URL 用
  `this.header.get('host')` 拼 `this.exchange.protocol`，缺 host 抛 `ThrowAdapter`。
- `Request/Header` 的 `_I.GET` / `_I.KEYS` 是直接符号键（不是 `{ GET: … }` 嵌
  套），因为该 subject 只有一个概念。

### Request Body 与 @produck/fugue

- 契约：`_I.SOURCE.GET()` 答 **node `Readable`**（下游交入站流）；
  `_S.DISTRIBUTOR_CTOR` 答 `Fugue.Distributor` 的具体子类（2026-10-14：该键已删，
  改答来自 Workflow 的 `$I.STATE.ReadableStreamDistributor`）。
- `data` = `distributor.fork()`，**每次访问都 fork 一份新的完整拷贝**
  （`body.data !== body.data`），返回 **WHATWG `ReadableStream`**（不再过
  `Readable.fromWeb()`）；转换边界只剩源侧一处
  `Readable.toWeb(this[_I.SOURCE.GET]())`。两侧不同族是有意决定：`data` 交 WHATWG
  不算"要收起来的分配器细节"。
- **观测面不做**（2026-10-10 定）：handler 作者只需要 `data`。上了 fugue 之后不需要
  在 exchange 生命周期上提供流的可观测性——每个作用域只关心**自己拿到的那几份流的
  状态**，而那是**流实例自身的状态**（`ReadableStream.locked` / reader 的
  `closed`）；adapter 交完源流就退场，同样不需要。随之定下：`degraded` /
  `terminated` / 10 个 warn 码都不进公开面（**2026-10-14 反转**：12 项 `options`
  改由本包代理进公开面，见下一条）；`I.DISTRIBUTOR` **保持私有**（连"升格为
  `$I`"也否决）。源流状态也不提供观测：会与分发语义冲突——消费
  较慢的 fork 还没结束，却看见源流已关闭，观感是错的。
- **源流收尾未定**：可能做**延迟释放**；"先 `terminate()`"可能是更安全的策略。当前
  Body 只建 distributor、只开 `data`。实测对照（同一份 body、两份 fork、读完 `a` 的
  第一块后调用）：`terminate()` **同步**、返回 `undefined`、只拒绝新 `fork()`
  （`Distributor has been terminated`）、**已发出的副本继续读到各自终点**、不取消
  源、无需吞 rejection；`destroy()` 异步返回 Promise、同样拒绝新 `fork()`，但**会
  error 掉已发出的副本**、**取消源**（实测 `readableEnded=false`），且可能 reject
  （内部 `await agent.pullingSettled` 会把源读错重抛）而当前没有错误通道（第 13
  条）只能吞掉。结论：`terminate()` 严格更安全——结束那一刻只**关门禁**（防结束后
  继续开新副本导致无界增长），真正的释放（cancel 源 + error 副本 + 释放介质）留给
  更晚的时点。
- `'close'` 是**事实上的契约事件名**：`Exchange` 构造器用它清超时定时器，派发方是
  `CompoundWorkflow`（`await workflow` 的 `finally` 里）；没被文档化，语义见第 16
  条。
- **事件通道是另一条线**：把 distributor 的信号引到 exchange 体系、让 handler 用户
  针对事件做动作（如写日志），见第 13 条。两件事不矛盾：一条关的是"不开状态
  getter"，另一条关的是"事件有没有通道"。
- **不自己定义 Distributor 层**：Body 只认"整个具体 Distributor"，介质契约回到
  fugue 自己的公开面（`$I.STATE.ReadableStreamDistributor` + fugue 的介质槽）。
- **12 项 fugue 选项由本包代理**（2026-10-14，用户口径"全都要 + 本仓代理，替下游
  屏蔽 distributor 的复杂性"）：键用 **PascalCase**（`MaxChunkStashByteLength` /
  `ForkedReadableStreamHighWaterMark` / `DegradeOnChunkStashFullAndDone` / 4 组重试
  次数与间隔），目录 `Configuration/`（`items/exchange.mjs` 与
  `items/distributor.mjs` 各自**默认导出**一组项、`index.mjs` 汇总为 `Item.{Exchange,
Distributor}` 并生成逐项访问器与读点）——**不用标记位区分**哪些项是代理项，
  靠"住在 `items/distributor.mjs` 里"这件事本身说明；**配置只是记录**：record 由
  `Configuration` 自己用 **`WeakMap<workflow, configuration>`** 挂着（2026-10-15 用户
  口径："算了，还是解耦吧，用弱映射建立 configuration 记录到 workflow 实例的关系。
  别瞎暴露符号了"——中间那版"record 挂进 `$I.STATE` + 从 `Workflow/index.mjs` 导出
  `STATE` 符号"已回退）；**安装由 `Workflow` 构造时正常做**（同口径："在这边正常进行
  configuration 的安装"）：构造器调 `installConfiguration($(this))`——键必须是
  `$(this)` 的那个**面**，因为 Exchange / Body / `Tune` 拿到的都是面；
  `configurationOf(workflow)`（**模块私有、不导出**，2026-10-15 用户口径：
  "`configurationOf` 不应该被导出"）只查不建，查不到就按**参数类型错**抛
  `Invalid "args[0] as workflow", one "Workflow" expected.`（2026-10-15 用户口径：
  用 `ThrowTypeError`，不走 `Ow.Error.Common`）；**外部读值只走 `Get.get<键>`**（同样是
  2026-10-15 口径：Body 构造器里那个 `value` "应该用 Get 接口实现"，Exchange 的
  `maxExchangeTimeout` 一并发成 `Get.getMaxExchangeTimeout(workflow)`）。
  **默认值是抄 fugue 的**（2026-10-15 用户口径："我没说过不重述 fugue 的默认值。kitty 是对
  fugue 的全面代理，屏蔽了 fugue 的复杂性的默认值抄写吧"）：12 项都给了具体初值
  （`1 << 30` / `false` / `1` / `Infinity` / `1000`），因此 Body 那边曾经那个
  `value !== undefined` 门禁**删掉了**——结构上值必有值，逐项直接 `Tune`。抄写的一个
  已知偏差：fugue 的 `MaxTransferrerBacklogWarningByteLength` 是**读时派生**（跟随
  `MaxChunkStashByteLength`），我们抄成了静态 `1 << 30`，所以调大/调小 stash 上限时它
  不再跟着变（要跟就得在 Body 里给这一项传 getter 函数，属于另一件事）。
  **`Fugue.Options.Tune` 不在 `Configuration` 里发生**，而在 Body 建分发器那一步：
  `Request/Body/_Abstract.mjs` 的构造器里，拿 `Configuration.Item.Distributor` 的键直接查
  fugue 的 `Options.Tune.<键>`（键即 fugue 的名字；**不做加载期校验**——2026-10-15 用户
  口径："这个检查用不上，`applyOptions` 只是包内使用"；同一轮又定"直接内联到
  `AbstractRequestBody` 的构造器里，这里不复杂"，于是 `Request/Body/Options.mjs`
  整块删除），Body 在 `new` 完 distributor 后立刻跑这个循环；入口只有逐项的
  `Configuration.Tune.tune<键>(workflow, value)` / `Get.get<键>(workflow)`
  （2026-10-15：`Accessor.mjs` 合进 `index.mjs` 直接实现、不再有创建工厂；**批量
  `tune(workflow, options)` 已删**）。**未代理**：fugue 的
  `Preset.*`。**per-exchange
  粒度做不到**：Body 构造早于 attacher 与 handler，且 `I.DISTRIBUTOR` 私有。
- **`Configuration` 与 `Workflow` 单边依赖**（2026-10-15）：`Configuration` 不再
  import `Workflow`（连 `_Borrow.mjs` 都没有，也不需要导出任何符号）；反方向留一条
  `Workflow/_Abstract.mjs → Configuration`，用途只是构造时 `installConfiguration()`。
  这条边不成环：`Configuration` 只 import 两个 items 文件与 argot，所以
  `Workflow/index → _Abstract → Configuration` 到头。两个遗留代价：①记录以**对象
  身份**为键，`$(this)` 取得的面与裸实例是两个键（实测 `new` 交出的就是面，而
  `useWorkflow(kit)` 也交同一个面，所以正常路径一致）；②`installConfiguration` 必须
  在构造期就把面装进去，否则一次 `Get.get<键>` 就会抛 `args[0] as workflow`。
- **源流必须是字节流（`objectMode: false`）**。实测 objectMode 源会让 fugue 的降级
  探针在第一次 pull 就误判越限，随后去读介质槽并抛
  `Static member "._transferrerCtor" must be implemented`；http1.1 / http2 的入站流
  本来就是字节流，不会踩。
- **包内还没有降级介质的实现**（`Fugue.DegradedChunkReader` 家族 +
  `Transferrer`）。

### Workflow / CompoundWorkflow

- `Workflow/_Abstract.mjs` 的抽象面只有 `_I.COMPOSE.EXTEND` 与
  `_I.COMPILE_ARTIFACT`。
- `Workflow` 构造器把自己的 Exchange 配置装到自己的 kit 上，并把**面**登记进去：
  `WorkflowKit[K_WORKFLOW] = $(this)`、
  `Configuration.install(WorkflowKit, $(this))`——`$(this)` 必须有：构造期
  直接交 `this` 会把生实例登记出去（`useWorkflow` 发出去的面失去校验，
  `tuneMaxExchangeTimeout(workflow, …)` 也查不到，实测）。
- `[$I.COMPILE](server, DeploymentKit = this[$I.KIT]('Kitty<Deployment>'))` 写
  `DeploymentKit[K_DEPLOYMENT_SERVER] = server`。
- `get isFinalized()` 就是 `Object.isFrozen(this)`，没有单独布尔位。
- **`setReadableStreamDistributor(Constructor)` 是应用侧设置可读流分发器的入口**
  （2026-10-14 落）：类写进 **Workflow 的私有 `STATE` record**
  （`$I.STATE = { ReadableStreamDistributor: null }`）——所以 `finalize()` 的
  `Object.freeze(this)` 之后**仍可换**（用户口径："运行时也允许切换分发器类"；
  这是"改的实现必须显式写出来"的一个实例）。用户口径（2026-10-14）：**专门给
  Workflow 开一个 `STATE` 私有成员，作为 record 形状维护那些可变的相关资源**；
  **record 内部的键直接用 string，不用符号**。**不是 Exchange 的 Configuration
  要素，也不落 kit**（同日回退了早先那版）。setter 先做类型检查：
  `isSubConstructor(Constructor, Fugue.Distributor)`，不过则抛
  `args[0]`（与本包 `Adapter/Registry.mjs` 同一口径；`@produck/fugue` 已在
  `dependencies` 里）。实测（`logs/probe-workflow-face.ign.mjs`）：设后读回同一个
  类；`finalize()` 之后再设成功，而实例仍是 frozen；非派生类被拒。**消费侧已接**
  （2026-10-14）：Body 的 `A.I.DISTRIBUTOR_CTOR` getter 经
  `useWorkflow(this[PART.I.EXCHANGE][EXCHANGE.$I.KIT])` 读 `$I.STATE`——先前的
  “未定”已定，且实测见第 17 条。**门禁**（2026-10-14）：`$I.DEPLOY` 先查
  `$I.STATE.ReadableStreamDistributor`，未设直接 `Ow.Error.Common` 抛，不得部署。
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
  （存在性互斥）+ `index.mjs` + `_Symbol.mjs`（借表时多一个 `_Borrow.mjs`）。目录
  路径即其符号命名空间。
- **`Parser.mjs` 也跟着 subject 分区**（2026-10-11）：校验词汇归它的 subject——
  `Request/Parser.mjs` 持有 `HttpMethod` / `ExchangeMode`（前者原本在共享的
  `Exchange/Parser.mjs` 里），`Request/index.mjs` 里 `export * as Parser`；共享的那
  份只剩跨界词汇（HTTP 版本、状态码、协议、header 名/值、`Iterable`、配置用整数校
  验）与 `HttpMethodList`。`HttpMethodList` 留在 Exchange 侧但从
  `Request/Parser.mjs` 引 `HttpMethod`——多了一条"Exchange 级模块依赖 Request 级"
  的边，与 `Exchange/_Abstract.mjs` 引 `Request/index.mjs` 同向，可以接受。
- **part** ＝ `ExchangePart` 家族的实例（Request / Response / Header / Body 以及后续
  成员）。
- **slot**（槽位）＝ `_S` 里的一个键，值是一个类引用，语义是"下游必须在这里挂上具
  体实现"。
- **fork** ＝ 从 `Fugue.Distributor` 取一份新的、从第 0 字节起的完整拷贝。
- `done`（数据到头）· `closed`（读取器/流被生命周期关闭）· `destroyed`（分发器销
  毁）——三个词不混用。
- **internal** ＝ adapter 提供的**连接期业务对象记录**（h1 的 req / res、h2 的
  stream / req / res、https 的 TLS 相关对象……）。形状由 adapter 定，核心不解释；
  它是 adapter 把上下文接进 Exchange 契约的那只手。
- **identity** ＝ adapter 从协议运行时里**挑**出的、每个 exchange 一个的原生对象
  （h1 用 `req`、h2 用 `stream`；**不用 `socket`**，那是连接期的），用于
  identity–exchange 强绑定去重。

## 暂缓 / 待定

> 编号是**引用锚点**：已定的条目直接删除、不重排，所以会出现跳号。

1. **规范草案（`code-style/…/partial-constructor/README.md`）待修订**：①
   `_Borrow.mjs` 该不该规定转发形状（现只有 `export * as` 的惯例）；②BTB-1 的
   "borrowed table" 与实情不符（`_A` 永为空，实际转发的是源模块的符号命名空间）；
   ③"空表不建、不导出"要写明表清单是白名单；④ABS-1 的 "expected to derive from"
   是否覆盖**包内家族基类**（`ExchangePart` 是具体类却被六个 subject 继承）；⑤
   LAY-7 与 LAY-8 在共享具体基类下互相打架；⑥
   `20-produck-commit.instructions.md` 举例 `message.draft.ignore` 不匹配它自己要
   求的 `*.ign*`；⑦能力符号（`K_*`）不在任何 subject 的 `_Symbol.mjs` 里——它跟
   端口走，STB-1 是否要为本类定义开例外或另立一条。
2. **PUB-2 未做**：`src/index.mjs` 只导出 `Workflow`，Workflow 的抽象成员符号
   （`_I.COMPOSE.EXTEND` / `_I.COMPILE_ARTIFACT`）尚未按 PUB-3 以"选择"的形式开出
   去。参考做法：包出口带 `SYMBOL.<模块>.<表>.<键>`，并直接暴露抽象 subject 供下游
   `extends`。
3. **Body 与 config 的关系未定**：`Configuration/` 已有 `maxBodySize` /
   `maxRequestBodyBuffer` / `allowedBodyMethods`，一个都没接到 fugue 上。要定
   `maxBodySize` 对应 fugue 的哪一档（`MaxChunkStashByteLength`？还是硬上限 +
   413）。
4. **默认降级介质由谁提供未定**：包内没有 `Fugue.DegradedChunkReader` 的实现（内存
   或临时文件）。按"不组装介质"的定调它不在 Body 层，但放哪一级、要不要出未定
   （第 22 条给了落点）。
5. **`data` 是否改为缓存首次 fork 未定**：现在是每次访问新 fork。
6. **`Workflow/_Abstract.mjs` 两处 `Ow.throw('…')` 抛裸字符串**
   （`$I.ASSERT.FINALIZED` / `.NOT_FINALIZED`），同文件其它地方用
   `Ow.Error.Common`。要不要统一，未定。
7. **文档过时**：`ARCHITECTURE.md` 的公开 API 表与 Request 成员树、`DESIGN.md` 若干
   表、`src/Exchange/EXCHANGE.md` 仍列着本包不存在的成员或未落地的"计划"段落
   （`Exchange.Implement()` 那段同属此列）。
8. **`test/*.mjs` 是重构前的骨架**：仍 import `../src/Symbol.mjs` /
   `../src/Abstract.mjs`，并引用已不存在的 `Adapter.Registry.define` 等 API；
   `test/Transaction.test.mjs` 为空且已不被 `test/index.mjs` 引入。按 `DESIGN.md`
   属"设计沙盒"，暂未处理。
9. **Adapter / handler / kitty 三域尚无代码**：10 个占位 workspace 只有
   `package.json`；`AdapterKit.*` 与 `Adapter.Registry.registerAdapter` 全仓零调用
   点。
10. **何时对 distributor 配置未定**：fugue 的选项**逐实例**（`Options.Tune` /
    `Options.Get`；`Preset` 只是若干 `Tune` 的打包），默认值来自它的 `Items.mjs`，
    安装点在 `Distributor` 构造器里；而我们把 distributor 建在 `Body` 构造器里、锁
    进私有槽 `[I.DISTRIBUTOR]`、无公开 getter——**目前没有任何时刻／入口能配它**。
    三个子问题：(a) **谁配**——`Body` 把 `maxBodySize` 等翻译过去，还是下游在具体
    Distributor 子类里自己 `Tune`；(b) **何时配**——fugue 每项**读取时机不同**，配
    晚了等于没配：`MaxChunkStashByteLength` / `DegradeOnChunkStashFullAndDone` 每趟
    pull 都读（随时可调）、`ForkedReadableStreamHighWaterMark` 每次 fork 读一次
    （第一份拷贝出去就固化）、读写器那几对重试预算在各自的 initialize / dump /
    drain 时读一次；(c) **入口形态**——公开 `get distributor()`、构造期回调的 `_I`
    钩子，还是全交给下游的 Distributor 子类构造器。
11. **distributor 的观测怎么导到 exchange 体系上，未定**：该有个地方把 distributor
    的信号（`fork` / `degrade` / `terminate` / `warn`）转发／代理进 exchange 体系，
    让 handler 能**针对事件**动作（如写日志）。**责任归属没想好**，候选：`Body`
    （持有 distributor 且自己是 `EventTarget`，最直接）／`Exchange`（也是
    `EventTarget`，又是 handler 拿到的对象）／`CompoundWorkflow` 的 runtime exchange
    attacher（机制已在 `I.MIXIN.EXCHANGE.ATTACHER.LIST`，不必新造概念）／`adapter`
    （交出源流即退场，最不像）。`ExchangePart extends EventTarget` 已定，所以差别不
    再是"能不能挂事件"而是**转发/代理的责任落在哪一层**。连带要定：转发哪几种事
    件；10 个 warn code 折不折叠；事件名用 fugue 的词还是 kitty 的词（与"不让用户
    理解分配器细节"冲突）；listener 抛错怎么办（是否污染 fugue 自己的派发）；订阅
    时机与解除（handler 在 `use()` 时？执行时？）。
12. **`handleExchange` 对 `internal` 的守卫强度未定**：现状**完全不校验**（连"必须
    是对象"都没有）。是符合"不解释形状"的本意，还是入口该补一句极浅的检查？
13. **`'close'` 的语义与契约化未定**：只有一个消费者（`Exchange` 清超时定时器），
    派发方却是 `CompoundWorkflow` 在 `await workflow` 的 `finally` 里——一个字符串
    撑起跨模块约定，却从未写进契约。要定：公开契约还是内部约定；语义是"**workflow
    调用结束**"还是"**exchange 生命周期结束**"（不等价）；关闭时做什么
    （`terminate()` 同步门禁 / `destroy()` 立即释放 / 延迟释放，见"Request Body 与
    @produck/fugue"的对照）；要不要换成符号或常量、要不要带关闭原因。
    - **写回响应的路由也没着落**：listener 手里不再有 Exchange（`handleExchange`
      不返回它），"把响应写回 socket"悬空。候选：①`handleExchange` 返回 exchange；
      ②具体 Exchange 在构造器里订阅 `close` 时写回（例子现在这么写，标
      `[pending 16]`）；③attacher 或专用 hook 承担。定之前，
      `test/Adapter.example.mjs` 只是"按现码能跑通"的一种写法。
14. **header `_I.GET` 的契约与实现不符**（2026-10-11 写例子时发现）：`Request` 与
    `Response` 的 Header 都把 `_I.GET` 声明为 `.returns(M.String)`，但 `has()` 与
    `Request.get url()` 靠 `undefined` 判"不存在"，契约会以
    `Invalid "member", one "string" expected.` 拦下（实测）；`res.getHeader()` 还可
    能答 number 或数组，同样违约。难点：`returns()` 只收**一个** parser、method
    member **一次性**（不能二次 `.returns()`），而 Member 词表（`Any` / `String` /
    `Undefined` / `OrPromise`…）里没有并集或可选组合子——得自己写一个（如
    `Optional(M.String)`，与 `OrPromise(parser)` 同形）。
15. **`Adapter.Registry` 的 `constructor` 默认值不可达**（实测）：
    `isSubConstructor` 是**严格**的（`isSubConstructor(net.Server, net.Server) ===
false`），而选项默认值正是 `net.Server`，于是**省略 `constructor` 必然抛**
    `Invalid "options.constructor", …`——默认值是死代码，"必填"又没写在任何地方。
    收口：①删默认值、明记必填；②`X === net.Server || isSubConstructor(X,
net.Server)`。倾向②。
16. **在 kit 上读不存在的符号属性抛出莫名的 `TypeError`**（实测）：`@produck/kit`
    在 `get` 陷阱里拼 `Dependence "${property}" is undefined.`，`property` 是
    **Symbol** 时模板转换先炸（`Cannot convert a Symbol value to a string`）。于是
    "`ExchangeKit` 上还没有 exchange"这种最常见的缺槽，报的不是缺依赖而是这句无关
    的话（实测对象是 `Kit.global` 直接读；`Getter.use` 是否同路径未逐项验证）。收
    口：①`useExchange` 读不到时自己先抛一句人话；②报给 `@produck/kit`（模板里
    `String(property)`）。倾向①。
17. **Distributor 落在哪一级、谁来提供**（2026-10-11 记，2026-10-14 已落）：当时现状是树的
    `REQUEST.BODY.DISTRIBUTOR_CTOR` 一格（值不是函数），由 `RequestBody` 静态槽
    `_S.DISTRIBUTOR_CTOR` 在 body 构造时取用（记录就在同一行可用）。问题是**层级错
    配**：类级（设计期）槽，主人却是应用配置级（**部署期**）事实。已形成的口径：
    - **改从端口拿**：body 构造时读 kit → `_S.DISTRIBUTOR_CTOR` 整格可删，树里不再
      有"值是类"的例外格，`RequestBody` 静态面清空。**入口已落**（2026-10-14）：
      `Workflow.setReadableStreamDistributor()` 把类写进 **Workflow 自己的私有槽**
      （`$I.STATE.ReadableStreamDistributor`；record 内部键是 string），定义期
      与运行期都可换，**消费侧已接**（2026-10-14）：Body 的 `A.I.DISTRIBUTOR_CTOR`
      getter 经 `useWorkflow` 读这里；**树里那格已死**——marker 探针
      （`logs/probe-implement.ign.mjs`）证明被构造的是 Workflow 给的那个类，树里的
      `distributorCtor` 一次也没被构造。**已删（2026-10-14）**：Body 的 `_S` 整张表
      与 `Abstract.Static` 那一行、`Implement/Normalize.mjs` 的 `distributorCtor`
      分支、`Implement/index.mjs` 的静态 getter 与解构、`test/Adapter.example.mjs`
      的静态 getter（示例里的 `Http1Distributor` 改成 named export，等宿主侧接线）。
      副作用：Exchange 现在必须在 Workflow 之下构造（探针已改成真 kit 链）。
    - **状态活在层级上／改的能力（权限）是你选的面／改的实现（机制）必须显式写出
      来**。例：要求"运行期不停机替换、且不外溢给 Adapter / Mixin 面"⇒ 只能挂
      `ExchangeKit`（`AdapterKit` 的兄弟，读只向上；每次 exchange 新建，首次 `set`
      必然合法）。
    - **键与类型归消费方**：键由 Exchange 家族拥有并出口（PUB-2）；`Fugue.Distributor`
      的引用与 `SubConstructorOf` 校验留在消费方（唯一构造点已在
      `Request/Body/_Abstract.mjs` import fugue）；Workflow 只提供"能写的地方"；
      校验落在 attach 那一级。（2026-10-14 修订：setter 里的早校验让 Workflow
      也 import 了 fugue——"校验归消费方"这条与现状有出入，待定要不要把 setter
      那段撤掉。）
    - **默认值归消费方**，用 `Getter.touch` 判缺失——第 6 条由此有落点。
    - **树里那一格现在必须是包装过的类**：0.4.x 起层要求派生类经
      `SubConstructorProxy` 构造，裸类在 body 构造期抛
      `It MUST SubConstructorProxy("Distributor").`（实测）。两条路：下游自己包
      （写进交付面契约），或本包在树边界包一次（需幂等——同一类包两次抛
      `Extending proxy has already been created`）。
    - **观测**"这个 exchange 用哪一个"不必额外记账：实例已在构造时快照进
      `I.DISTRIBUTOR`，`data` 每次 `fork()`。
    - **Configuration 面与它的关系未定**（2026-10-11：用户指出我此前那部分的理解
      不在点上，待再谈）。
18. **交付面示例还没改**：`test/Adapter.example.mjs` 演示的是**手写七个类**的路线
    （抽象层仍可达、路线仍有效），没演示 `Implement`。要不要改以 `Implement` 为主、
    手写降为附注，未定。
19. **`Implement/` 的两个小节未定**：①`PART` 表目前从 `../Request/_Borrow.mjs` 借
    （**别的 module 的 `_Borrow.mjs`**，BTB-5 反对），是否改由
    `Exchange/_Borrow.mjs` 再导出、只借自己 module 的表；②`I_OPTIONS_CONTEXT` 定义
    在 `Implement/index.mjs`（私有级 `.#`），按 STB-1 该进 `_Symbol.mjs`，而该目录
    按 LAY-5 是非 subject 元素、不受该约束——要不要给它一张表。
