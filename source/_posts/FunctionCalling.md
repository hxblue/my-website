---
title: "Claude Code 的工具输出方式和国内 GLM / 豆包等 OpenAI-compatible function calling 有什么不同？他们各自这样设计的优缺点是什么？"
date: 2026-08-03
updated: 2026-08-04
categories:
  - "AI 与 Agent"
tags:
  - "Function Calling"
description: "不同的Function Calling方式"
cover: /images/covers/cover-276452.webp
---
https://platform.claude.com/docs/zh-CN/agents-and-tools/tool-use/overview

> "Tool use"（工具使用）让 Claude 能够调用您定义的函数或 Anthropic 提供的函数。Claude 会根据用户的请求和工具的描述来决定何时调用工具。然后它会返回一个结构化的调用，由您的应用程序执行（客户端工具）或由 Anthropic 执行（服务器工具）。

Cladue Code 的方式是自己定义tools Schema , 然后CC 想要调用它的话就会返回一个 tool_use , 执行完后 产生这个tool_result 。还有就是使用tool_choice来觉得CC何时使用工具 ， auto 就是代表允许CC自行觉得是不是调用任何可用的工具。此外还有any  , tool , none 。


![image](https://qcn7qkoanip2.feishu.cn/space/api/box/stream/download/asynccode/?code=YWYxMzNhY2QzYmQ1NzEwNjY1NzBhN2U3NDAzZWMxNmRfRm45Z3BEblVKWGc5RU1TTUNCQXA2Vmplekd2NDQ1eVRfVG9rZW46VWFvbGJaNnJIb1RYeEx4SVh5eGNzTWxHbnVmXzE3ODU3MzUyMTA6MTc4NTczODgxMF9WNA&add_watermark=true&scene_type=CCM)


CC的工具结构定义就和OPENAI的不同


```text
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "获取指定地点的天气信息",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string"
                    }
                },
                "required": ["location"]
            }
        }
    }
]
```


```text
tools = [
    {
        "name": "get_weather",
        "description": "Get the current weather for a given location.",
        "input_schema": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "City and state, e.g. San Francisco, CA",
                }
            },
            "required": ["location"],
        },
    }
]
```


Claude code: 表达能力强 ， 而且天然适合复杂Agent


文本、思考、工具调用、工具结果、图片和文档都可以表示成不同的 content block。一个 assistant turn 中可以混合多个 block，工具错误也有明确的 `is_error`。对于 Claude Code 这种需要记录文件操作、命令执行、子 Agent、Hook 和长程任务的系统，这种结构更容易形成完整、可回放的事件轨迹。


缺点是协议更严格，也更难接入通用生态。比如工具结果虽然语义上来自“工具”，在消息层面却被表示成 `role=user`；`tool_result` 的位置还有严格约束，顺序错误会直接导致请求失败。已有大量基于 OpenAI 协议开发的框架，也需要增加 Anthropic adapter。


OpenAI :  最大的优势是简单，兼容性强


OpenAI提供了两套API抽象接口：Chat Completions API 和  Responses API(优先使用这个)


assistant 负责产生 `tool_calls`，工具用独立的 `role=tool` 返回结果，参与者身份比较直观。GLM、豆包、DeepSeek、Kimi 等提供 OpenAI-compatible 接口后，开发者通常只需要更换 `base_url`、API Key 和模型名称，就能复用 OpenAI SDK、LangChain、LlamaIndex 等生态代码。智谱官方文档也明确展示了这种迁移方式。


它的缺点是传统 Chat Completions 的工具结构相对“扁平”。arguments 是 JSON 字符串，非流式时要反序列化，流式时还要先拼接字符串再解析；错误没有统一的一等字段，开发者常把错误 JSON 塞进 content；不同厂商虽然声称 OpenAI-compatible，但在 finish_reason、思考字段、流式分片和严格模式方面仍可能存在差异。


这里再解释一下这个arguments,这个看起来像JSON对象，但在API返回结构中，它实际是一个字符串

> `tool_calls[].function.arguments` 明确定义为 `string`，只是这个字符串的内容采用 JSON 格式。非流式反序列化 ：把String 类型转成这个 WeatherArgs  流式要拼接再进一步解析

这里最明显的区别是Cladue 的工具结果是 tool_result block 而GLM，豆包等的是 独立的role = "tool" 消息。


Claude code 把一次模型消息看成由多种内容块构成 ，因此一个 assistant 消息不必只是纯文本，可以同时包含不同类型的数据。


而OpenAI 返回的 是


```text
{
  "id": "call_123",
  "type": "function",
  "function": {
    "name": "get_weather",
    "arguments": "{\"location\":\"北京\",\"unit\":\"celsius\"}"
  }
}
```


"arguments": "{\"location\":\"北京\",\"unit\":\"celsius\"}" 这里的参数是一个装着 JSON 内容的字符串，所以处理的时候需要一层转换 ，转换成JSON才方便后续处理调用函数


Claude 的原生 Tool Use 采用内容块协议，强调多模态表达、严格的调用—结果关联以及复杂 Agent 执行轨迹；GLM、豆包等 OpenAI-compatible Function Calling 采用 `tool_calls` 与独立 `tool` 角色，强调接口简洁和生态兼容。


Claude Code 的 `stream-json` 是 Agent Runtime 级事件流，它不仅输出模型的工具调用，还输出工具结果、最终回答、session 和运行生命周期信息。其内部沿用 Anthropic 的 Content Block 协议：模型通过 `tool_use` 发起调用，参数 `input` 是结构化对象；工具结果通过 `tool_result` 返回，并可用 `is_error` 明确表示失败。GLM、豆包等 OpenAI-compatible Chat Completions 则属于模型 API 层：模型在 assistant 消息的 `tool_calls` 中给出函数名和字符串形式的 `arguments`，开发者执行工具后，再用独立的 `role="tool"` 消息和 `tool_call_id` 回传结果。Anthropic 的设计表达能力更强，适合复杂 Agent 和多模态工具结果，但协议严格、生态适配成本较高；OpenAI-compatible 设计更直观、兼容生态更广，但开发者需要自行处理参数解析、错误表达和完整的 Agent 执行循环。
