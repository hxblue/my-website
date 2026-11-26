# 中枢调用约定

这是现有命令行能力的调度契约。下列 JSON 用于中枢任务和结果记录；现有脚本不会直接接收这种 JSON，也没有对应的 HTTP 路由。

## 发现与注册

在中枢的技能目录登记 `feishu-blog-publish`，加载同目录 `SKILL.md` 的 `name`、`description` 和正文；按需加载本参考。若中枢仅支持一个文档，可同时提供两个文件的内容。复制整个 Skill 目录可保留相对引用。

建议能力摘要：

> 将指定飞书文档或知识库文档同步为 Chblue 博客文章，支持本地预览、手动发布及同文档更新；保留网址、下载图片，通过 GitHub 和 Vercel 上线。执行入口为指定 Windows 执行机上的 npm 命令。

登记执行机地址或队列、仓库工作目录和允许的操作模式。中枢服务与执行机须有实际的任务派发连接；这个文档本身不建立远程执行通道。不向中枢知识库登记飞书 token、应用密钥、GitHub token 或 Windows 凭据。

## 任务输入

```json
{
  "capability": "feishu-blog-publish",
  "mode": "publish",
  "document_url": "https://qcn7qkoanip2.feishu.cn/wiki/ZaZSwmSkYi1k8jkWl15cQRXMnjd",
  "metadata": {
    "category": "AI 与 Agent",
    "tags": ["Pi", "Agent", "源码阅读"]
  }
}
```

`mode` 仅为 `sync` 或 `publish`，应来自用户对中枢的请求及中枢已有授权策略。未传元数据时保留现有文章信息；首次发文可传 `metadata.slug`、`description` 和 `cover`。任务校验时拒绝空 `document_url`：脚本在没有链接时只打印帮助并退出 0，不能据此判断同步成功。

映射为子进程参数，例如：

```text
程序：node
参数：["tools/sync-feishu.cjs", "--publish", document_url, "--category", category, "--tag", "Pi", "--tag", "Agent"]
工作目录：E:\CodeProject\claudeproject\developer_protfolio-hexo-publisher
shell：false
```

`publish` 使用上述专用克隆。调度前核对当前分支为 `hexo-site` 且 `git status --porcelain` 为空，再执行 `git pull --ff-only origin hexo-site`。若依赖未安装或锁文件在快进时更新，执行 `npm ci`。遇到未提交文件或无法快进时保留现场并按下文恢复。

`sync` 省略 `--publish`，工作目录使用 `E:\CodeProject\claudeproject\developer_protfolio-hexo`。两种目录各自串行执行写入和构建操作。

省略不存在的选项，不将数组直接转成一个标签字符串。捕获退出码、stdout 和 stderr；耗时操作保持任务运行并向用户反馈有意义的进展，不因调用方单次等待超时就再启动一个相同发布进程。同一仓库的写任务串行运行，避免互相修改工作区或同时执行 Hexo clean/build。

## 结果记录

以下为中枢生成的建议结构；示例不是实时部署结果：

```json
{
  "capability": "feishu-blog-publish",
  "mode": "publish",
  "status": "deployed",
  "document_id": "O9PgdtlfJoKIcNx69CKcOmrKnQd",
  "source_revision": 101,
  "post_path": "source/_posts/pi-agent-source-notes.md",
  "article_url": "https://my-website-two-mauve-11.vercel.app/blog/pi-agent-source-notes/",
  "media_count": 2,
  "commit": null,
  "deployment_verified": true,
  "error_stage": null,
  "message": "示例：文章和素材均已在线验证"
}
```

从实际日志、文章 front matter、Git 和部署检查填写字段。没有获取到的值使用 `null`；不要把示例文档 ID、版本、媒体数量或状态当成新任务的真实结果。成功推送后将 `commit` 填为实际完整 SHA。

| 状态 | 判定依据 |
| --- | --- |
| `imported_local` | 同步退出 0、日志显示导入完成，目标文章及引用的本地素材存在；未推送 |
| `unchanged` | 发布日志明确显示“内容未变化，无需重复发布”；本次未新增提交。不据此声称历史部署一定正常 |
| `pushed` | Git 原子推送已成功；Vercel 尚未核实完成 |
| `deployed` | 对应提交部署成功，正式文章及素材可访问，博客列表包含文章入口 |
| `attention_required` | 需要恢复认证、授权文档、处理工作区改动或合入远程提交；保留现场 |
| `failed` | 转换、下载、构建、提交、推送或部署失败；记录具体阶段 |

已安装并登录 GitHub CLI 时，可在该仓库查询对应提交的部署状态：

```powershell
gh api repos/hxblue/my-website/commits/<实际完整SHA>/status
```

检查 `context` 为 `Vercel` 的状态，再访问正式文章、当前引用的图片和 `/blog/` 列表；仅有 HTTP 200 还应核对文章标题或内容，避免把旧页面、登录页或错误回退页当成成功。若无法查询部署，结果停在 `pushed` 并说明未验证，不能填 `deployed`。

## 预览后再发布

`feishu:sync` 留下的文章和素材属于未提交改动，不能直接接着调用要求干净工作区的 `feishu:publish`。

用户随后要求发布该预览时：

1. 确认文件确属本次指定文档，检查相对于同步前基线的差异及当前暂存区；无基线时逐项核实，不把其他改动一起发布。
2. 在 `main` 或 `hexo-site` 分支运行 `npm run build`；失败不提交、不推送。
3. `git fetch origin main hexo-site`，确认两个远程分支都是当前 HEAD 的祖先；存在新提交时先处理合并，不强推。
4. 仅暂存已核实的 `source/_posts/<slug>.md` 和实际存在的 `source/images/posts/<slug>/`。提交前再次检查暂存区只包含这些目标文件。
5. 提交后执行 `git push --atomic origin HEAD:refs/heads/main HEAD:refs/heads/hexo-site`，再按上节校验部署。

## 失败恢复

- 文档或媒体权限不足：保留 `user` 身份，报告缺少的权限或目标资源；不尝试 bot 身份绕过访问限制。不要要求用户在聊天中粘贴密钥。
- 转换或下载失败：当前实现会在通过全部转换检查后才写入文章和公开素材；检查日志后解决具体不支持的块，不静默删掉内容发布。
- 构建失败：导入文件可能已保留在工作区；修复后按“预览后再发布”恢复，不循环重跑发布入口。
- 提交失败：检查工作区及暂存区，保留用户内容，不自行 reset、stash、删除或提交整个仓库。
- 推送失败：本地提交可能已创建。记录其 SHA，检查两个远程引用；若仍可安全快进，直接重试同一提交的原子推送。不要重新导入制造重复提交。无变化检测不会自动补推之前失败的提交。
- 部署失败：记录已推送 SHA 和部署页面，诊断构建或托管问题；不要把“推送成功”当成任务已经完成。

只对明确的临时网络错误做有限重试；认证、权限、内容格式、分支分叉和构建错误需先解决原因。原子推送若结果不明，先核对远程提交状态，再决定是否重试。
