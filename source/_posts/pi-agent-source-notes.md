---
title: Pi Agent 源码学习笔记：架构、执行循环与记忆机制
date: '2026-11-14 09:20:58'
updated: '2026-11-14 09:24:01'
categories:
  - AI 与 Agent
tags:
  - Pi
  - Agent
  - 源码阅读
description: 从 AgentSession、Agent 和 Agent Loop 追踪 Pi 的任务执行、工具调用、会话存储与记忆机制。
cover: /images/blog-hero-anime.webp
feishu_document_id: O9PgdtlfJoKIcNx69CKcOmrKnQd
feishu_source: https://qcn7qkoanip2.feishu.cn/wiki/ZaZSwmSkYi1k8jkWl15cQRXMnjd
feishu_revision: 101
---

**阅读目标**：沿一次真实任务读懂 Pi，知道模型、工具、消息历史和会话管理分别由谁负责，并能定位下一步要看的源码。

源码基线：本地 **F:\Code\pi-agent**，提交 [eb326d2](https://github.com/earendil-works/pi/tree/eb326d265ae0b88489a6d10319307780df827cdf)。整理日期：2026-11-06。文中的源码链接固定到该提交；长期记忆的数据结构属于设计建议。

> 💡
>
> **先读主链**：AgentSession → Agent → Agent Loop → 模型与工具。已经读过 agent.ts 后，下一步是 agent-loop.ts 的 runLoop()，再接会话存储和压缩。


# 总体架构：谁负责哪一层

![文档图示](/images/posts/pi-agent-source-notes/whiteboard-ac801f05377a.jpg)

图中蓝色连线表示执行主链与请求交互，灰色虚线表示运行事件回传。工具实现位于 coding-agent 等应用模块，由 agent 层的执行循环调用。

| 模块 | 负责的事情 | 阅读入口 |
|-|-|-|
| packages/coding-agent | 组装会话、工具、上下文、扩展与 CLI；处理历史恢复和压缩。 | [sdk.ts · createAgentSession()](https://github.com/earendil-works/pi/blob/eb326d265ae0b88489a6d10319307780df827cdf/packages/coding-agent/src/core/sdk.ts#L191) |
| packages/agent | 维护运行状态，循环调用模型与工具，处理排队、取消和事件。 | [agent.ts · Agent](https://github.com/earendil-works/pi/blob/eb326d265ae0b88489a6d10319307780df827cdf/packages/agent/src/agent.ts#L188)；[agent-loop.ts · runLoop()](https://github.com/earendil-works/pi/blob/eb326d265ae0b88489a6d10319307780df827cdf/packages/agent/src/agent-loop.ts#L163) |
| packages/ai | 统一模型、消息、工具声明和流式响应；适配不同 Provider。 | [models.ts · Provider / Models](https://github.com/earendil-works/pi/blob/eb326d265ae0b88489a6d10319307780df827cdf/packages/ai/src/models.ts#L149) |

组装关系在 sdk.ts 中很直接：先创建 Agent，注入 streamFn、消息转换与上下文处理回调，再创建 AgentSession，把 Agent、SessionManager、ResourceLoader 和模型运行时交给它。终端渲染位于 packages/tui，理解执行主链时可以后看。

# 一次任务怎样从输入走到完成

用“读取配置文件，把端口改为 8080”贯穿源码。下面是执行机制的示例；具体工具选择由模型响应决定。

```text
用户消息：读取配置文件，把端口改为 8080
  → AgentSession 整理输入、资源和当前会话
  → Agent.prompt() 启动运行
  → 第一次模型响应：toolCall(read, 参数)
  → 执行 read，追加 toolResult（文件内容）
  → 第二次模型响应：toolCall(edit, 参数)
  → 执行 edit，追加 toolResult（修改结果）
  → 第三次模型响应：向用户说明修改结果
  → 没有工具调用、待处理队列或继续决策时结束
```

**run、turn、message 的区别**：一次 run 是一次完整的 Agent 运行；一个 turn 包含一次模型响应及其工具调用和结果；message 是历史中的一条记录。一个 run 可以包含多个 turn，一个 turn 可以产生多条 message。

[runLoop()](https://github.com/earendil-works/pi/blob/eb326d265ae0b88489a6d10319307780df827cdf/packages/agent/src/agent-loop.ts#L163) 的内层循环处理工具调用与 steering 消息；准备停下时，外层再检查 follow-up。finishTurn 回调也可以要求再发起一次请求。因此，出现一次普通文本响应，并不必然代表整次 run 已结束。

![文档图示](/images/posts/pi-agent-source-notes/whiteboard-4b344a94f22e.jpg)

图中行号对应 agent-loop.ts（commit eb326d2）。左侧蓝线是内层循环：每轮调用一次 LLM，有工具调用就执行并写回结果，再取 steering 消息后回到循环条件。右上是外层循环：内层结束后检查 follow-up 和 finishTurn 的 continue 决策，都没有才发 agent_end。

**模型请求前的数据处理**：当前消息 → transformContext（可选整理）→ convertToLlm（转换内部消息）→ 规范化模型上下文 → streamFunction。应用可以有自定义消息，但只有转换后的模型消息参与请求。实现见 [streamAssistantResponse()](https://github.com/earendil-works/pi/blob/eb326d265ae0b88489a6d10319307780df827cdf/packages/agent/src/agent-loop.ts#L381)。

# agent.ts：保存状态、启动运行、接收事件

```text
prompt(input)
  → normalizePromptInput()：统一成 AgentMessage[]
  → runPromptMessages()
      → runWithLifecycle()：建立取消信号和运行状态
          → runAgentLoop(新消息、上下文快照、配置、事件回调)
              → processEvents()：更新状态，再通知监听器
      → finishRun()：清理状态、解除等待
```

字符串输入会被包装成 user 消息；消息对象会被包装成数组。已有任务运行时再次调用 prompt() 会被拒绝，运行中的补充输入需要进入队列。createContextSnapshot() 对 messages 和 tools 做数组浅拷贝，消息对象本身并没有被深拷贝。

## 状态何时发生变化

| 事件或操作 | 状态变化 | 含义 |
|-|-|-|
| message_start / message_update | 更新 streamingMessage | 提供当前正在生成或处理的消息。 |
| message_end | 把完成的消息加入 state.messages | 用户输入、模型回复和工具结果在这里积累成历史。 |
| tool_execution_start / end | 向 pendingToolCalls 添加或移除调用 ID | 跟踪尚未结束的工具调用。 |
| turn_end | 提取 assistant 消息中的错误信息 | 上层可以读取 errorMessage。 |
| finishRun() | 关闭 isStreaming，清理临时状态，兑现等待 Promise | 整次运行真正回到空闲状态。 |

实现见 [processEvents()](https://github.com/earendil-works/pi/blob/eb326d265ae0b88489a6d10319307780df827cdf/packages/agent/src/agent.ts#L565)。它先更新内部状态，再按订阅顺序 await 监听器。AgentSession 正是通过这类事件把消息追加到会话存储。

**三个容易混淆的边界**：prompt() 返回 Promise<void>，回复从事件或 state.messages 获取；isStreaming 覆盖整次运行，执行工具期间也可能为 true；agent_end 是最后一个循环事件，仍需等监听器完成并执行 finishRun() 后才算空闲。

## 排队、继续与取消

- **steer()**：插入当前任务的补充或纠正，在回合边界由循环取出；不会立即中断已经发出的模型请求。
- **followUp()**：当前任务原本准备停止时，再取出后续请求。两类队列默认每次取一条，也可设置一次取全部。
- **continue()**：基于已有历史继续。尾部已是 assistant 回复时，会尝试取出排队消息；没有新消息则拒绝继续。
- **abort() / waitForIdle()**：前者发出取消信号，后者等待运行及监听器收尾。模型和工具通过 AbortSignal 配合取消。
- **reset()**：空闲时清空对话和队列，保留当前系统提示与工具声明基线。

# 工具调用：模型选择动作，代码执行动作

先读 [read.ts](https://github.com/earendil-works/pi/blob/eb326d265ae0b88489a6d10319307780df827cdf/packages/coding-agent/src/core/tools/read.ts#L86)。一个工具需要给出名称、用途说明、参数结构和 execute()。模型返回工具名称与参数，循环负责查找工具、准备并校验参数、执行代码，再把结果包装成 toolResult。

工具结果里的 **content** 用于模型可见的结果表达**；details** 承载应用使用的附加信息，例如截断信息。read 工具会解析路径、读取文件、处理 offset/limit，并在输出过大时截断及提示继续读取的位置。

多个工具调用默认允许并行，工具也可以要求串行。并行执行时，工具完成事件可以按实际完成顺序到达，写回的工具结果消息仍保持原始调用顺序。读 [executeToolCalls()](https://github.com/earendil-works/pi/blob/eb326d265ae0b88489a6d10319307780df827cdf/packages/agent/src/agent-loop.ts#L508) 时要区分这两种顺序。

beforeToolCall、afterToolCall 提供执行前后的接入点；异常工具结果也会反馈给模型，便于模型决定下一步。安全限制是否实施，取决于上层应用接入的策略和执行环境。

# 短期记忆：消息历史、会话投影与摘要

**同一会话的工作上下文由消息历史承载**。Agent 保存运行中的 messages；SessionManager 把记录追加到 JSONL 会话日志，以 id、parentId 和当前叶节点组织会话树。恢复会话时，沿当前分支构建模型上下文。

“磁盘里保留的历史”和“这一轮模型收到的上下文”需要分开理解。[buildContextEntries()](https://github.com/earendil-works/pi/blob/eb326d265ae0b88489a6d10319307780df827cdf/packages/coding-agent/src/core/session-manager.ts#L476) 会根据最新压缩检查点选择有效记录；已被摘要覆盖的旧消息仍在日志里，但不再自动逐条发送给模型。

## 默认压缩策略

| 项目 | 当前源码的默认行为 |
|-|-|
| 触发条件 | 估算上下文用量 > 模型窗口 − reserveTokens；reserveTokens 默认为 16,384。 |
| 近期保留预算 | keepRecentTokens 默认为 20,000，以 token 预算选择边界，并照顾完整工具调用关系。 |
| 摘要内容 | 目标、约束与偏好、已完成 / 进行中 / 阻塞事项、关键决策、下一步、重要上下文。 |
| 后续再次压缩 | 把旧摘要与新增历史一起交给 LLM，更新进度和下一步；程序另行追加读过、修改过的文件列表。 |
| 原始记录 | 追加包含 summary、firstKeptEntryId 等字段的压缩检查点，原始会话消息仍然保留。 |

参数与算法见 [默认配置](https://github.com/earendil-works/pi/blob/eb326d265ae0b88489a6d10319307780df827cdf/packages/coding-agent/src/core/compaction/compaction.ts#L126)、[prepareCompaction()](https://github.com/earendil-works/pi/blob/eb326d265ae0b88489a6d10319307780df827cdf/packages/coding-agent/src/core/compaction/compaction.ts#L872) 和 [compact()](https://github.com/earendil-works/pi/blob/eb326d265ae0b88489a6d10319307780df827cdf/packages/coding-agent/src/core/compaction/compaction.ts#L965)；实际设置可以覆盖默认值。

```text
当前系统提示与工具声明
  + 旧历史的结构化摘要
  + 保留的近期消息
  + 压缩后新增的消息
```

**长工具回合的处理**：切分落在一轮任务中间时，Pi 会额外生成该轮前半段的请求与进度摘要，帮助后半段继续。摘要输入中的每条工具结果最多保留前 2,000 个字符，再添加截断说明，见 [serializeConversation() 的截断规则](https://github.com/earendil-works/pi/blob/eb326d265ae0b88489a6d10319307780df827cdf/packages/coding-agent/src/core/compaction/utils.ts#L93)。因此，摘要不能替代完整日志或原文件。

# 长期记忆：Pi 已有的能力与可接入方案

本次阅读的 Coding Agent 内置路径提供持久会话、AGENTS.md / CLAUDE.md 等上下文文件、Skills 和扩展接口，没有默认的独立事实记忆库及逐条记忆版本链。跨会话数据可由扩展维护文件或数据库，见 [扩展状态存储说明](https://github.com/earendil-works/pi/blob/eb326d265ae0b88489a6d10319307780df827cdf/packages/coding-agent/docs/extensions.md#state)。

需要给 Pi 增加长期记忆时，可以由扩展提供检索、写入工具，并在请求前把与当前任务相关的记忆放入上下文。下面是可采用的数据组织方式，**属于设计建议**。

| 组成 | 保存什么 | 读取时机 |
|-|-|-|
| 当前记忆 | 主体、作用域、属性、当前值、版本和来源。 | 日常回答和执行任务时优先检索。 |
| 重要变更历史 | 旧值、新值、变化原因、有效时间和状态。 | 查询过去状态、解释变化或回溯错误时。 |
| 来源引用 | 会话 ID 与原始消息 / entry ID，指向原始依据。 | 核实记忆、处理冲突或更正提炼错误时。 |

**示例**：项目 A 从 MySQL 迁移到 PostgreSQL。当前记录更新为 PostgreSQL，旧版本标记为“已被替代”，变更记录关联用户确认迁移的那条消息。问“现在用什么”取当前值，问“迁移前用什么”再查历史。

版本边界按**同一主体＋同一属性＋同一作用域**确定。“项目 B 使用 MySQL”应是另一条记忆。重复描述可去重；确实变化时保留重要修订；原先就记错的内容标记为“已撤回”，避免再次作为事实参与回答。存储历史与把全部历史放进提示词，是两种不同选择。

# 源码阅读顺序与完成标准

先看 [最小 SDK 示例](https://github.com/earendil-works/pi/blob/eb326d265ae0b88489a6d10319307780df827cdf/packages/coding-agent/examples/sdk/01-minimal.ts)，确认外部调用只有创建会话、订阅事件、提交输入三个主要动作。随后按下表推进；每阶段读到能解释对应现象，再进入下一阶段。

| 顺序 | 阅读材料 | 完成标准 |
|-|-|-|
| 1 | [types.ts](https://github.com/earendil-works/pi/blob/eb326d265ae0b88489a6d10319307780df827cdf/packages/agent/src/types.ts#L374) → [Agent.prompt()](https://github.com/earendil-works/pi/blob/eb326d265ae0b88489a6d10319307780df827cdf/packages/agent/src/agent.ts#L373) | 指出消息、工具、状态和事件四类对象；说明 message_end 如何改变历史。 |
| 2 | [runLoop()](https://github.com/earendil-works/pi/blob/eb326d265ae0b88489a6d10319307780df827cdf/packages/agent/src/agent-loop.ts#L163) → [工具调用测试](https://github.com/earendil-works/pi/blob/eb326d265ae0b88489a6d10319307780df827cdf/packages/agent/test/agent-loop.test.ts#L305) | 跟踪模拟模型第一次返回 echo 调用、第二次返回最终回复；说明第二次请求为什么需要工具结果。 |
| 3 | [read.ts](https://github.com/earendil-works/pi/blob/eb326d265ae0b88489a6d10319307780df827cdf/packages/coding-agent/src/core/tools/read.ts#L86) → executeToolCalls() | 从工具参数追到真实文件读取，再追到 toolResult；区分 content、details、错误与取消。 |
| 4 | [AgentSession.prompt()](https://github.com/earendil-works/pi/blob/eb326d265ae0b88489a6d10319307780df827cdf/packages/coding-agent/src/core/agent-session.ts#L1967) → SessionManager → Compaction | 解释为什么旧消息仍在 JSONL 中，模型却只收到摘要与保留区；指出恢复时选择的是哪条分支。 |
| 5 | [扩展 Runner](https://github.com/earendil-works/pi/blob/eb326d265ae0b88489a6d10319307780df827cdf/packages/coding-agent/src/core/extensions/runner.ts#L1298) → [模型接口](https://github.com/earendil-works/pi/blob/eb326d265ae0b88489a6d10319307780df827cdf/packages/ai/src/models.ts#L900) | 定位记忆检索、新工具或上下文策略的接入点；理解换 Provider 时哪些上层逻辑保持通用。 |

**当前最合适的下一步**：在 agent-loop.ts 中按 runLoop() → streamAssistantResponse() → executeToolCalls() 追一次工具回合，并在旁边记录每一步 messages 新增了什么。暂时把终端排版、模型目录生成、实验性的服务运行时放到后面，避免启动细节打断主线。





# 附录



## 极简的数据分层

Pi 最大的亮点是**每一层只知道下一层,互不渗透**:

```text
packages/ai      → 统一多 provider API,不知道什么是"agent"
packages/agent   → 纯 agent loop,不知道什么是"文件"或"终端"
packages/durable → session 持久化,不知道上层业务逻辑
packages/coding-agent → 组装成 CLI,定义具体工具(Read/Write/Bash)
```

这就意味着每一层都可以单独替换，测试



```javascript
┌─────────────────────────────────────────────────────┐
│  packages/coding-agent                              │
│  ┌───────────────────────────────────────────────┐ │
│  │ createReadToolDefinition(cwd) {               │ │
│  │   return {                                    │ │
│  │     name: "read",                             │ │
│  │     execute: async (id, {path}) => {          │ │
│  │       const content = await fsReadFile(path); │ │  ← 具体实现:读文件
│  │       return {content: [...], details: {}};   │ │
│  │     }                                         │ │
│  │   }                                           │ │
│  │ }                                             │ │
│  └───────────────────────────────────────────────┘ │
│                       ↓ 实现                        │
│  ┌───────────────────────────────────────────────┐ │
│  │ createCodingToolDefinitions(cwd) => [        │ │
│  │   createReadToolDefinition(cwd),             │ │
│  │   createBashToolDefinition(cwd),             │ │
│  │   createEditToolDefinition(cwd),             │ │
│  │   createWriteToolDefinition(cwd),            │ │
│  │ ]                                            │ │  ← 组装工具集
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
                       ↓ 传给
┌─────────────────────────────────────────────────────┐
│  packages/agent                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ const agent = new Agent({                    │ │
│  │   tools: [...],  // 接收任意 AgentTool[]     │ │
│  │   streamFn: ..., // 接收任意 StreamFn        │ │  ← 抽象接口
│  │ });                                           │ │
│  │                                               │ │
│  │ // agent loop 执行                            │ │
│  │ for (const toolCall of assistantMessage) {   │ │
│  │   const tool = findTool(toolCall.name);      │ │
│  │   const result = await tool.execute(...);    │ │  ← 不关心工具具体做什么
│  │ }                                             │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
                       ↓ 调用
┌─────────────────────────────────────────────────────┐
│  packages/ai                                        │
│  ┌───────────────────────────────────────────────┐ │
│  │ streamFn(model, context, options) {          │ │
│  │   return anthropicProvider.stream(...);       │ │  ← 只负责调 LLM API
│  │ }                                             │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘

```









## Session的树状结构

Pi 的会话不是简单的消息数组,而是一棵树:

```text
root
├─ model_change (切到 gpt-4)
│  └─ user: "写个函数"
│     └─ assistant: "好的..."  ← 分支 A
│        └─ user: "再优化"
│
└─ user: "写个函数"  ← 从这里 fork 出分支 B
   └─ assistant: "换个思路..."
```





## Hook驱动的扩展点

Pi 不在核心 loop 里写任何业务逻辑,全靠 hook 注入:

```typescript
const agent = new Agent({// 工具调用前拦截,可以阻止执行
  beforeToolCall: async ({toolCall, args}) => {if (toolCall.name === "bash" && args.command.includes("rm -rf /")) {return {block: true, reason: "危险命令"};}},// 每轮结束后决定是否继续
  finishTurn: async ({message, toolResults}) => {if (shouldStop(message)) return {action: "end"};},// 发 LLM 请求前重建上下文
  prepareRequest: async ({context}) => ({
    context: {...context, messages: await loadFromDB()}}),});
```





## AgentMessage vs LLM Message 的转换

Pi 区分了两种消息类型:

- **`AgentMessage`**:应用层的消息,可以有自定义类型(比如 `notification`、`compaction` 等)
- **`LLM Message`**:只有 `user`/`assistant`/`toolResult` 三种,LLM 能理解的

两者通过 `convertToLlm()` 函数转换:

```typescript
const agent = new Agent({
  convertToLlm: (messages) => messages.flatMap(m => {
    if (m.role === "notification") return []; // 过滤掉 UI 专用消息
    if (m.role === "compaction") return [{role: "user", content: m.summary}]; // 转成 user 消息
    return [m]; // 保持原样
  }),
});
```



## 工具并行执行

Pi 支持并行执行工具调用,但设计很巧妙:

```javascript
// 全局配置
const agent = new Agent({toolExecution: "parallel"});

// 但某个工具可以强制串行
const dangerousTool: AgentTool = {
  name: "delete_file",
  executionMode: "sequential", // 覆盖全局配置
  execute: async (...) => {...}
};

```
