# 从飞书文档手动发布博客

继续在飞书写作，用文档链接同步到 Hexo；发布后由现有 Vercel 项目自动部署。无需在网站中保存飞书密钥。

## 第一次使用

本机需安装 Node.js、Git 和官方 `lark-cli`，完成飞书用户身份登录，并且该用户能够读取目标文档和素材。当前电脑已配置飞书 CLI。换电脑时请按飞书 CLI 官方指引完成安装、应用配置和文档读取授权，不要把账号凭据提交到仓库。

在仓库目录运行 `npm ci`。支持 `/docx/` 文档链接和 `/wiki/` 知识库文档链接。

## 常用操作

只导入本地、先看效果：

```powershell
npm run feishu:sync -- "飞书文档链接" --slug my-article --category "AI 与 Agent" --tag Agent --description "文章摘要"
npm run build
npm run dev
```

首次发布一篇新文档，也可直接运行：

```powershell
npm run feishu:publish -- "飞书文档链接" --slug my-article --category "AI 与 Agent" --tag Agent
```

文章后续在飞书修改后，只需再次运行：

```powershell
npm run feishu:publish -- "同一篇飞书文档链接"
```

可以重复传 `--tag`；`--cover /images/xxx.webp` 设置封面。首次不指定 slug 时会生成稳定的文章名。再次同步按照飞书真实文档 ID 找到原文章，保留原文件名、发布日期、分类和封面，不因标题变化而产生第二篇文章。需要调整元数据时可重新传对应选项。

`feishu:publish` 会检查工作区干净、当前分支为 `main` 或 `hexo-site`、远程分支能快进，再导入、构建、只提交该文章与图片，并同时推送两分支。其他未提交的修改会阻止自动发布。如果先使用 `feishu:sync` 生成了待审阅改动，请审阅后手动提交这些改动并推送；无需再运行一次 `feishu:publish`。构建失败时不会推送。命令显示“已推送”代表已触发部署，线上可用时间以 Vercel 部署完成为准。

## 内容与图片

- 正文、标题、链接、列表、Markdown 表格和代码块保留；提示块转为引用。
- 飞书内嵌图片下载到 `source/images/posts/<文章名>/`；画板保存为飞书导出的图片。媒体下载使用同一用户身份。
- 原文中的普通外部图片 URL 保持原样；飞书临时下载链接及未支持的内嵌表格、同步引用等会阻止导入，避免静默丢失内容。复杂画板、公式和布局应检查页面预览。
- 同步是单向的：飞书正文会覆盖博客中的该篇正文；不要在两边同时编辑正文。旧图片不会自动删除，以免破坏已有链接。
- 原始下载缓存保存在被 Git 忽略的 `.preview/feishu-sync/`，公开目录只保存文章使用的素材。

## 本次已接入的文章

《Pi Agent 源码学习笔记：架构、执行循环与记忆机制》：

```powershell
npm run feishu:publish -- "https://qcn7qkoanip2.feishu.cn/wiki/ZaZSwmSkYi1k8jkWl15cQRXMnjd"
```

发布地址：`/blog/pi-agent-source-notes/`。这篇文章后续修改后，运行上面的同一条命令即可更新。
