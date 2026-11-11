---
title: "Oenhands的状态机设计有什么优缺？更优雅的实现方式是什么？"
date: 2026-08-03
updated: 2026-08-04
categories:
  - "AI 与 Agent"
tags:
  - "Agent"
  - "状态机"
  - "OpenHands"
description: "Agent状态机理解"
cover: /images/covers/cover-35652460.webp
---
首先先看看Openhands 是什么东西？


OpenHands 是一个开源的软件开发 Agent 平台，可以理解为开源版的 Claude Code 或 Codex。它接入大语言模型，并为模型提供文件操作、终端执行、代码修改和浏览器等工具。模型负责决定下一步动作，运行环境负责执行动作，Controller 通过事件流和状态管理不断将工具结果反馈给模型，直到任务完成。因此，OpenHands 不只是一个聊天机器人，而是一个能够在代码仓库和沙箱环境中持续执行多步任务的 Agent 系统。


![image.png](/images/posts/ANGENT%E7%8A%B6%E6%80%81%E6%9C%BA%E8%AE%BE%E8%AE%A1/caee7bf8d860.png)


OpenHands 的这个“状态机”并不负责决定 Agent 下一步调用什么工具，也不负责保存完整对话。它更像 Conversation 的交通信号灯：告诉运行循环、服务器、远程客户端和 UI——这个 Conversation 现在能不能继续跑、是不是在等待用户、是否已经结束或异常。


![image.png](/images/posts/ANGENT%E7%8A%B6%E6%80%81%E6%9C%BA%E8%AE%BE%E8%AE%A1/71c1b362af17.png)

- ConversationExecutionStatus类 , 它就是有这个execution_status 来向系统各层说明概括 现在执行到了哪里（IDLE ， running , finished ，），这里重点看这个IDLE表达什么情况：IDLE = "idle" # Conversation is ready to receive tasks 。OpenHands在刚新建conversation的时候就赋值status = idle 。也就说说明idle 实际上混合了 空闲 和 已有输入但尚未执行 这两种情况。
- send_message()默认只添加消息，不自动启动Agent。这个时候会将status 设置为IDLE（从Finished , STUCK）用户又提供了新输入，之前那次运行结果不再代表当前待处理状态。
- 最终由EventService.run()来执行具体的任务 ， 这个在这个启动前会检查`execution_status` 是否已经是 `RUNNING`；如果已经再运行了，会返回HTTP 409 。反之 status 变成running (从 IDLE， PAUSED ， ERROR， STUCK ) ， 也就是说上一次运行失败或卡住了 ， 但用户仍然可以再次运行。
- 在Runtime状态下 ，就是构造上下文 ， 调用LLM ， 返回结果无外乎两种：要么LLM要调用工具 ， 要么返回纯文本。注意当返回文本信息的时候就会将这个 状态设置为 Finished ，

所以在 OpenHands 中，`FINISHED` 的准确含义不是：

> 整个 Conversation 永久结束。

但是OpenHands 支持 Stop Hook。这个用来检查真的有运行结束吗？是不是还有事情没有做完？


如果检查完后发现不能Finishaed 就会 Runtime了


第一次 `FINISHED` 只是：

> Agent 自己认为结束了。

第二次 Stop Hook 允许后的 `FINISHED` 才是：

> 整个运行引擎确认结束了。

但这两个状态使用了完全相同的枚举值。


这就是当前状态机最核心的建模问题：**它没有区分“Agent 提议结束”和“运行引擎确认结束”。**


以上这个问题会影响远程客户端，这导致了：


普通 FINISHED：不完全可信


完整状态快照：可信


REST FINISHED：短时间内不完全可信


REST 持续 FINISHED 30 秒：作为兜底接受


下一个问题：这里状态还有一个叫 WAITING_FOR_CONFIRMATION  #Conversation is waiting for user confirmation ，这样的做法会导致


接口语义不够干净，因为 `run()` 同时承担了很多含义：

- 从 `IDLE` 调用：开始运行；
- 从 `PAUSED` 调用：恢复运行；
- 从 `ERROR` 调用：重试；
- 从 `STUCK` 调用：解除卡住并重试；
- 从 `WAITING_FOR_CONFIRMATION` 调用：批准危险操作；
- 从 `FINISHED` 调用：什么也不做。

一个方法根据当前状态表达六种不同命令，理解和维护都会变得困难。


第三个问题：pasued() 和 interrupt 有什么区别 ，前者是温和暂停 ， 后者是立即中断


但这两个方式最终都会导向这个 PASUED暂停状态。这说明 `PAUSED` 只是外部展示状态，具体是温和暂停还是强制中断，需要看事件历史，而不是只看枚举。


当前的这个设计并不是一个严格的状态机设计，现在缺少一个统一的入口判断这个状态切换是不是合理的


更优雅的设计是什么样的？


Conversation 是一个长期存在的“会话容器”，Run 是这个容器里一次具体的 Agent 执行。容器是否可用，与其中任务执行到哪一步，是两个不同问题。


```text
class ConversationControlState(BaseModel):
    availability: ConversationAvailability
    execution: ExecutionState
    revision: int






class ConversationAvailability(str, Enum):
    ACTIVE = "active"
    DELETING = "deleting"





class ExecutionState(BaseModel):
    run_id: UUID | None = None
    phase: RunPhase = RunPhase.READY
    wait_reason: WaitReason | None = None
    outcome: RunOutcome | None = None

class RunPhase(str, Enum):
    READY = "ready"
    RUNNING = "running"
    WAITING = "waiting"
    FINALIZING = "finalizing"
    TERMINATED = "terminated"

class WaitReason(str, Enum):
    USER_PAUSED = "user_paused"
    CONFIRMATION_REQUIRED = "confirmation_required"


class RunOutcome(str, Enum):
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    STUCK = "stuck"
    CANCELLED = "cancelled"
    LIMIT_REACHED = "limit_reached"
```


| **字段**       | **回答的问题**              |
| ------------ | ---------------------- |
| availability | Conversation 还能不能接收命令？ |
| phase        | 当前 Run 执行到哪一步？         |
| wait_reason  | 如果正在等待，等待什么？           |
| outcome      | 如果已经结束，结束结果是什么？        |
| run_id       | 这是哪一次运行？               |
| revision     | 这是第几个状态版本？             |


在我看来就是不要再统一用这个ConversationExecutionStatus 统一表示所有的情况了。


```text
availability = ACTIVE
phase = RUNNING
```


Conversation 资源正常，Agent 正在执行任务。


```text
availability = ACTIVE
phase = TERMINATED
outcome = SUCCEEDED
```


Conversation 仍然存在，只是上一轮执行已经成功结束。


为什么avilablity 和 phase必须分开？


假设当前用户状态是


```text
availability = ACTIVE
phase = RUNNING
run_id = run-123
```


用户此时点击删除，


```text
第一步：
availability = DELETING
phase 仍然暂时是 RUNNING
```

> Conversation 已禁止新请求，但还有一个 `run-123` 需要取消。 然后自然而然就可以取消这个run-123 ,进而删除conversation .
>
> 如果沿用之前的这个单枚举设计 ， execution_status = DELETING  这样就无法获知 删除开始之前，Conversation 是否还有正在执行的 Run？
>
>
> 而两个状态维度可以保持这样的信息
>
>
> 事实一：Conversation 已经禁止使用
>
>
> 事实二：里面还有一个 Run 正在清理
>
>

现在来说明这几个RunPhase 分别代表什么意思

- READY
> 当前没有正在执行的 Run，Conversation 可以启动下一次运行。 新建 Conversation ：ACTIVE  + READY
>
> 用户发送消息后 ： ACTIVE  +READY  只有调用run 后 ACTIVE  + RUNNING
>
>
- RUNNING
> 当前存在一个正在执行的 Agent Run。正常情况下应该满足这个对应 ：phase == RUNNING   ， 意味着Eventservice中存在对应的活动 _run_task ，如果服务器重启后读到持久化状态仍为 `RUNNING`，但已经没有 `_run_task`，说明上一次进程异常退出，应执行崩溃恢复。
- WAITing
> 当前 Run 还没有完成，但无法自动继续，需要外部输入。 这里的关键就是需要区分 waiting的原因也就是需要什么来进行这个外部输入 ， 这时候需要wait_reason 。
- FINALIZING
> Agent 已经认为任务完成，但系统还在做最终确认和收尾。
>
> 这是整个设计中最重要的新状态。
>
>
> 当前 OpenHands 没有 `FINALIZING`，所以 Agent 一产生最终答案就设置 `FINISHED`，随后 Stop Hook 又可能改回 `RUNNING` 。这样就消除了当前 RemoteConversation 不敢相信 `FINISHED` 的问题。
>
>
- TERMINATED
> 当前这一次 Run 已经不可再自动执行，它得到了一个明确结果。但 Conversation 仍然存在。这里的结果通过 outcome来表示：SUCCEEDED ， FAILED ，STUCK 等等 ，这个就可以区分 RUN结束了 不等于  Conversation结束

它不是单纯把一个枚举拆成几个枚举，而是解决五个实际问题：

1. **删除与运行不再混淆**

`DELETING` 属于 Conversation 资源管理，`RUNNING` 属于 Agent 执行。

1. **FINISHED 变成真正可信的最终状态**

Stop Hook 阶段由 `FINALIZING` 表达，不再出现对外可见的临时 `FINISHED`。

1. **暂停和确认不再混为一谈**

二者都是 `WAITING`，但有明确的 `wait_reason` 和不同的允许命令。

1. **一次 Conversation 的多次执行能够区分**

每一次执行都有独立 `run_id`。

1. **远程状态同步不再依赖时序猜测**

客户端通过 `run_id + revision` 判断消息属于谁、是不是最新版本。
