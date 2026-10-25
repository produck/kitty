# DEV

## 文档分工

- `DEV.md`：为什么这样写。只记**当前生效的决策**与其代价；被推翻的写法直接删除。
- 其余文档记形状：`DESIGN.md` / `ARCHITECTURE.md` / `DEPLOYMENT.md` 是对外流程，
  `ATTACHMENT-PORTS.md` 是 kit 端口清单。
- 源码注释只留 `TODO` 与契约性说明。

## 架构基座

### 抽象层：@produck/es-abstract

- 声明面 `Abstract(cls, Abstract({...}), Abstract.Static({...}))`，契约用
  `Member as M`；实例成员与静态槽都是**访问时惰性校验**，抽象构造器不能
  直接 `new`。
- 声明了 `Abstract.Static({...})` 的类，派生必须经 `SubConstructorProxy`
  构造；构造体内的 `this` 是生实例，`new` 交出的是代理面，要把面交出去用
  `ShadowThis as $`。不写 `#` 私有字段——代理不认归属。

### 共享词汇：@produck/argot

- `Ow.Error.Common(...)` 抛 `Error`，`ThrowTypeError(path, expectation)` 抛
  类型错；`SYMBOL.CONSTRUCTOR` 是本仓捕获 `new.target` 的唯一写法。

### 附着与查找：@produck/kit

- `Kit(childName)` 每次新建代理、**不缓存**；读依赖先查自身、再沿父链。
- 同层重复写同名依赖抛错（不是覆盖）——所以每个 exchange 必须拿到新 kit。
- 跨模块能力走 `Capability.mjs` 的 `K_*` 符号 + `Kit.Getter`：
  `K_WORKFLOW`、`K_DEPLOYMENT_SERVER`、`K_EXCHANGE`。

### Symbol 表约定

符号表、借用表的全部规则见 partial-constructor 规范（SYM / STB / BTB）；本仓
没有增补，也不复述。

### 私有槽 + 只读 getter

- 构造期赋值、之后不变的成员写成“类字段 `[X] = null` + 构造器赋值”；下游要
  读的配 `get`，纯内部的只有槽。判据是**只读**，不是要不要暴露。

### 命名

- `new.target` 捕获的局部一律叫 `TargetConstructor`；`ctor` 只用于符号键。
- 具体基类不带 `Abstract` 前缀（`ExchangePart`）；`_Abstract.mjs` 里的类名带。
- 叫 Deployer 不叫 Adapter：抽象层的内涵是对**部署阶段**的适配，不是对协议、
  连接或消息的适配。

### 布局判据

只看这几条，不靠“它算不算一种 X”。

- **构造点归属**：谁 `new` 它，它就在谁下面。判据是 `grep new`。
- **子树方向单调**：顶层子树之间的边只朝根（`CompoundWorkflow → Workflow`），
  反向不行；子树内部父子互指正常。全图必须无环。
- **类走 barrel，符号走 `_Borrow`**：跨 subject 取类走对方 `index.mjs`，取符号
  走 `_Borrow.mjs`；子文件不写对方深路径。
- **barrel 形状**：`index.mjs` 导出实现类 + 全部子命名空间 + 叶子工具模块，
  不导出 `_Symbol` / `_Borrow` / `_Concrete`。
- **parser 层层下发**：每个目录一个 `_Parser.mjs`，首行
  `export * from '../_Parser.mjs'` 再补本层；消费方一律
  `import ... from './_Parser.mjs'`，不写 `../`。定义点取消费方与定义方的最近
  共同祖先，跨顶层子树就落到包根。`assert*` 与 parser 同住，区别只在是否返回值。

判据沉默的情形：`DataNormalizer` 描述的是一种归一化策略，不是框架契约，已停
到 `legacy.ign/`；契约收敛成 `CompoundWorkflow` 的一个抽象成员。

## 观点 / 决策

### Exchange 家族

三层，各自只回答自己那层：壳归 `Workflow/Exchange/`，两个协议族归
`CompoundWorkflow/{Http,WebSocket}Exchange/`，`Implement/Exchange/` 只是集成层的
打包入口，不是 subject。方向由谁 dispatch 决定：壳的 `Deployment` 要读 identity，
协议族要读复合工作流的 `STATE`。壳不认识工作流类型，`workflow` 走 capability。

- `Exchange`：协议共用壳——`identity` / `server` / `protocol` / `mode` /
  `httpVersion` / `workflow` / `toJSON`，加 `request` 与 `response`。抽象成员
  `_I.HTTP_VERSION` / `_I.MODE` / `_I.SERVER.GET` / `_I.SERVER.PROTOCOL.GET`，
  静态槽 `_S.REQUEST_CTOR` / `_S.RESPONSE_CTOR`。
- `HttpExchange`：只加两个 body 与 `[I.START_TIMING]`，`_I.MODE` 答 `'http'`。
- `WebSocketExchange`：**整条连接**，不是握手瞬间；主体是控制器 subject。
- 抽象成员下放到 part，`Exchange` 不当成员总线；`Part` 是**具体**基类。
- `internal` 是部署器提供的连接期记录，作为抽象成员的第一个实参下传，不挂 kit。
- 冻结落在具体实现点自己身上（构造器末尾），基类不自冻。

### Request / Response / Body

- Header 读松写紧：`_I.GET` 答 `HeaderValueOrUndefined`，写入预检用严格
  `HeaderValue`（两份 parser 都在 `Workflow/Exchange/_Parser.mjs`，跨目录消费的
  几个数值/方法 parser 在包根 `src/_Parser.mjs`）。
- `Request.get url()`：绝对 URL 直接用；相对 URL 用 `header.get('host')` +
  `exchange.protocol` 拼，缺 host 抛 `ThrowDeployer`。
- `Request.get body()` 按 `Configuration.Get.AllowedBodyMethods(workflow)` 设卡，逐次
  判定。
- 请求体：源侧收 node `Readable` → `Readable.toWeb()` → fugue distributor；`data`
  每次访问 fork 一份新的 WHATWG `ReadableStream`。`MaxBodySize` 走 `metric` 事件累
  加，超限 `destroy()` + `setStatus(413)`。
- 响应体是 sink：归一形状 `{ stream: ReadableStream | null, length: number | null }`
  （stream 为 `null` 时 length 必须为 `0`）。**归一化本身是工作流的抽象成员**，
  不是框架内置的插件体系：`_I.NORMALIZE_HTTP_RESPONSE_BODY_DATA` 由实现者填，
  `$I.NORMALIZE_HTTP_RESPONSE_BODY_DATA` 是对内的调用面，body 的 `data` setter
  只调 `workflow[_A.$I.NORMALIZE_DATA]`。注册表、`test`/`normalize` 插件协议
  已整体停到 `legacy.ign/`，作为下游可以自己实现的一种方案。
- fugue 的 12 项选项由本包代理（PascalCase，见
  `Configuration/items/distributor.mjs`），初始值抄自 fugue。它是这一层对下游的
  **基本期待**，在 Body 建 distributor 时应用一次，不是“随便可覆盖的默认值”。
- **逐 exchange 的差异由 handler 自己调**：`request.body.distributor` 原样暴露，
  框架不提供第二个配置入口，也不做变更追踪。
- **降级介质不由本包提供**：`DegradedChunkReader` 的具体实现由集成层挂
  `SYMBOL.DISTRIBUTOR._S.DEGRADED_CHUNK_READER_CTOR`；本包不选默认。
- 流收尾优先 `terminate()`（同步、只关门禁），不用 `destroy()`（会 error 掉已发
  出的副本并取消源）。

### 事件

- 事件只承载**决策与生命周期**，不承载数据。数据走流；用事件再发一遍等于开了
  第二条 IO 通道，下游会有两套读法与两套背压语义。
- 事件类型的数量不是成本，**契约**才是：类型只是字符串匹配，改名或改判据后下游
  静默失效。新增前先问“能否由已有事件推导”。
- 每个事件必须能回答：谁发、何时发、载荷、顺序、次数。
- `Exchange` 三件套：`exchange-pipeline-done`、`exchange-pipeline-error`
  （`detail.error`，随后原样 rethrow）、`exchange-pipeline-finish`（**不分成
  败**）。`done` / `error` 二选一先发，`finish` 必定最后，三者各恰好一次。
- `finish` 发在 `finally` 里，负责“恰好一次”。删掉它，收尾责任就落到每个
  deployer 身上，且 `HttpExchange` 的超时定时器会漏。
- 只在下游拿不到原对象时才转发：`distributor` 已原样暴露，故不转发 fugue 事件；
  node `readable` 被 `toWeb()` 封装后拿不到，所以 body 转发
  `http-request-body-data-{end,close,error}`。
- **不包庇监听器异常**：node 把监听器抛错放到 `nextTick` 重抛成
  `uncaughtException`，此刻进程状态未定义。库不装全局处理器、不在
  `dispatchEvent` 外包 `try/catch`，交给进程管理器重启。

### Workflow / CompoundWorkflow

- `Workflow` 只管管线：`use()` / `finalize()` / `PIPELINE`，加 `compile` / `deploy`
  两个骨架入口。它不装配置、不认识 `Configuration`。
- 抽象面只有 `_I.COMPOSE.EXTEND` 与 `_I.COMPILE_DEPLOYMENT`。
- 构造器只做一件事：把自己登记进 kit（`K_WORKFLOW = $(this)`）。
- `CompoundWorkflow` 的构造器在自己身上装配置：
  `Configuration.install(useWorkflow(kit))`——键取自 kit 里存的同一份 shadow，
  与 `Get.<键>(workflow)` 的查询键严格一致。非复合的派生类没有记录，读值直接抛。
  外部读值只走 `Get.<键>`，写入只走 `Tune.<键>`。
- `CompoundWorkflow` 是个**抽象类**，不是现成产品：它声明
  `_I.NORMALIZE_HTTP_RESPONSE_BODY_DATA`，未实现就不能用；所以本包只导出
  `CompoundWorkflow.Abstract`，不导出任何可直接 `new` 的复合工作流。
- 它的私有 `STATE` 只记一个可变资源（`RequestBodyDistributor`），`finalize()` 之后
  仍可用 `setRequestBodyDistributorConstructor()` 更换。
- “必须有请求体分发器”的卡点在 `CompoundWorkflow` 的 `$I.DEPLOY` 覆写上，所以
  `compile()` 不受影响，`deploy()` 与 `withDeployer().deploy()` 两路都会过它。
- `[COMPILE_DEPLOYMENT]` 只做四件事：跑 mixin 的部署 attacher → 取部署器类 → 注册
  workflow 侧的 handler → `new` 部署器、`$I.INSTALL()`、`$I.COMPILE()` 封口。它不写
  任何 kit 端口，也不碰产物形状。

### Deployment

编译产物是一个 subject（`Workflow/Deployment/`），不是一条记录：记录形式会迫使
`_I.COMPILE_DEPLOYMENT` 只能声明 `returns(M.Object)`，并把生命周期散成若干个
局部布尔。

- 它拥有：`KIT`、`SERVER`、`MANIFEST`、`LINK_LIST`、附着器列表、去重集合、
  `COMMITTED`、`LINKED`。全部是私有槽，公开面只有 `manifest` 与 `link()`。
- `link()` 自带一次性守卫（`LINKED`），并自己组合 linker 链；`COMMITTED` 只能由
  `$I.COMMIT()` 翻转。
- 收口叫 **commit** 不叫 compile：编译一次就是定义完成，之后写入一律拒绝；
  “compile” 在整个体系里已指 workflow → deployment 这个动作。
- **派发属于它**：`$I.HANDLE_EXCHANGE` 负责派生 ExchangeKit、构造、查重、附着、
  跑 pipeline、`finally` 里发 `finish`。它只从 workflow 读一个成员：
  `workflow[$I.PIPELINE]`（组合好的管道）。
- 因为派发在里面，部署器不需要第三个构造参数：`handle*Exchange` 直接
  `deployment[$I.HANDLE_EXCHANGE](ExchangeClass, internal)`。
- 查重失败报中性错（`The Exchange has already been dispatched.`），不带
  `Bad deployer:` 前缀——`Deployment` 不能 import `Deployer`（会成环），归因
  信息是这条约束的代价。

### Deployer

**定义面是一个类，不是 options 记录**，并且是**实例级**抽象：下游可以持有与
workflow 实例同寿命的实例级上下文。

- 静态抽象（派生用 `static get`）：`_S.TAG`（`M.String`，标签）、
  `_S.SERVER_CTOR`（注册表键）、`_S.EXCHANGE_CTOR.HTTP`（**必选**，缺了就是抽象
  层的 `must be implemented`）、`_S.EXCHANGE_CTOR.WEB_SOCKET`（**可选**：基类给
  返回 `undefined` 的默认 getter 以避开“未实现”判定，解析器放行 `undefined`）。
- 实例抽象：`_I.INSTALL(DeployerKit)`——下游唯一的部署定义入口。
- 构造器收 `(DeployerKit, deployment)`：部署器**直接往 deployment 写**，自己不留产
  物状态。`SYMBOL.CONSTRUCTOR = new.target` 是读静态槽的唯一途径。
- **能力长在 kit 上，状态待在 deployment 里**：公开成员可被下游覆盖（不安全），
  保护成员包外拿不到（不可用），kit 不是类成员，两头都不犯。构造器把六个附着
  过程全挂上：`declare` / `setServerLinker` / `appendExchangeAttacher` /
  `attachDeployment` / `handleHttpExchange` / `handleWebSocketExchange`。
- `attachDeployment` 写的是 `deployment[$I.KIT]`，并用 `deployment[$I.COMMITTED]`
  卡窗口；`DependenceName` 在包级 `src/_Parser.mjs`（不再专属于
  `CompoundWorkflow`）。
- **协议必须在构造前决定**：两个 exchange 的 `internal` 形状毫无共性，核心也不
  解释形状；单入口 `handleExchange` 把配对交给调用方，配错只能等某个 part 读
  `internal` 时才炸。也不能“构造完再看 `mode`”——`mode` 构造后才有。按协议分叉
  后，配对变成写在端口上的具名事实。
- 去重集合是 Deployment 的字段：一次部署一个作用域。
- 部署器**不维护自己的安装标记**：六个端口统一读 `deployment[$I.COMMITTED]`，
  只存一份状态，避开“装了但未 commit”这类未定义的中间态。
- 注册表只存**类**：`registerDeployer(DeployerClass)`，键是
  `DeployerClass[_S.SERVER_CTOR]`。
- 唯一的显式断言是 `SubConstructorOf(Deployer)`：普通类读不到静态槽，不加这条会静默
  注册成 `undefined`；其余校验由读槽本身完成。
- `getByServer(server)` 先查一次性部署的关联表，再按
  `Object.getPrototypeOf(server).constructor` 查注册表。

### Implement/Exchange

它是**打包的实现定义器**：一个入口交出一整套（Exchange + 各个 part）构造器，本身
没有“一个类一个 subject”的内涵，因此按 LAY-5 **永远是非 subject 元素**；拆成
subject 反而会把“成套交付”打散。

- 两个入口 `Http(options)` / `WebSocket(options)`，各自只归一自己的选项组；
  `Normalize/` 按层切目录：`Base.mjs` 管共性，协议文件追加各自新增的组。

### 依赖治理

`@produck/argot`、`@produck/compose`、`@produck/deep-freeze-enumerable`、
`@produck/es-abstract`、`@produck/es-abstract-member-constructor`、
`@produck/fugue`、`@produck/is-sub-constructor`、`@produck/kit`、`is-plain-object`。

## 术语

- **subject**：partial-constructor 规范里的一节一类一目录单位。
- **part**：`ExchangePart` 家族的实例（Request / Response / Header / Body）。
- **slot**：`_S` 里一个键，值为类引用，语义是“下游在这里挂具体实现”；必选还是可选，
  由成员解析器是否接受 `undefined` 决定。
- **fork**：从 distributor 取一份从第 0 字节起的完整拷贝。
- **done / closed / destroyed**：数据到头 / 读取器被生命周期关闭 / 分发器销毁。
- **internal**：部署器提供的连接期业务对象记录；形状由部署器定，核心不解释。
- **identity**：每个 exchange 一个的原生对象，用于去重。
- **DeploymentKit**：`WorkflowKit('Kitty<Deployment>')`，一次部署一个。
- **DeployerKit**：`DeploymentKit('Kitty<Deployer>')`，交给部署器的能力载体。

## 暂缓 / 待定

1. **两个 kit 入口对 `internal` 完全不校验**（连“必须是对象”都没有）；可选槽缺失
   也只能等调用入口才发现。
2. **`HttpExchange` 的超时只改状态**：不销毁请求体、没 `unref()`、也挡不住 handler
   已写入的状态被 503 覆盖。
3. **部分文档仍是旧形状**：`Workflow/Exchange/EXCHANGE.md`、`DESIGN.md` 若干表。
4. **其它域尚无代码**：handler / kitty 占位 workspace 只有 `package.json`。
5. **规范草案（`code-style/…/partial-constructor/README.md`）待修订**：`_Borrow` 的
   转发形状、BTB-1 的措辞、“空表不建”、能力符号是否进 `_Symbol.mjs`。
