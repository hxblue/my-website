# Butterfly 风格博客改版 Tasks

## File List

| Action | File | Responsibility |
| --- | --- | --- |
| Modify | `src/App.tsx` | 建立作品集与博客两套布局路由 |
| Create | `src/layouts/PortfolioLayout.tsx` | 承载现有作品集 Header、Outlet 和 Footer |
| Create | `src/layouts/BlogLayout.tsx` | 承载博客 Header、Outlet、Footer 和作用域根节点 |
| Create | `src/components/blog/BlogHeader.tsx` | 博客透明导航、滚动状态和移动菜单 |
| Create | `src/components/blog/BlogHero.tsx` | 博客首页沉浸式首屏 |
| Create | `src/components/blog/BlogFilters.tsx` | 搜索、标签、分类和重置操作 |
| Create | `src/components/blog/PostCard.tsx` | 交错文章卡片 |
| Create | `src/components/blog/BlogSidebar.tsx` | 作者、统计、最近文章、分类、标签和归档 |
| Create | `src/components/blog/BlogPagination.tsx` | 客户端分页控件 |
| Create | `src/components/blog/ArticleHero.tsx` | 文章详情封面与元数据头部 |
| Create | `src/components/blog/ArticleToc.tsx` | 桌面及移动文章目录 |
| Create | `src/components/blog/MarkdownCodeBlock.tsx` | 代码高亮、语言标签和复制反馈 |
| Modify | `src/components/BlogDetail.tsx` | 组合 Markdown 正文、自定义渲染和目录 |
| Modify | `src/components/LatestPosts.tsx` | 复用统一文章集合 Hook |
| Delete | `src/components/BlogCard.tsx` | 删除不再使用的旧文章卡片 |
| Delete | `src/components/BlogList.tsx` | 删除不再使用的旧文章列表 |
| Create | `src/hooks/usePublishedPosts.ts` | 文章集合远程优先、本地降级 |
| Create | `src/hooks/useBlogPost.ts` | 单篇文章远程优先、本地降级和未找到状态 |
| Create | `src/hooks/useActiveHeading.ts` | 监听当前正文标题 |
| Create | `src/hooks/usePageMeta.ts` | 管理页面标题、描述和 Open Graph 信息 |
| Create | `src/data/blogProfile.ts` | 博客作者、首屏和社交配置 |
| Modify | `src/data/blogs.ts` | 为本地文章补充可选元数据示例 |
| Modify | `src/types/blog.ts` | 增加博客筛选、统计、目录和配置类型 |
| Create | `src/utils/blog.ts` | 排序、筛选、统计、分页、阅读时间和目录纯函数 |
| Modify | `src/api/posts.ts` | 映射可选 Notion 元数据 |
| Modify | `src/pages/BlogPage.tsx` | 编排 Hero、筛选、卡片流、分页和侧栏 |
| Modify | `src/pages/BlogPostPage.tsx` | 编排详情加载、错误、Meta、正文和评论 |
| Modify | `src/index.css` | 增加博客作用域主题、组件和响应式样式 |
| Create | `public/images/blog/blog-hero.webp` | 原创博客首屏背景图 |

## T1: 扩展博客类型与静态配置

**Files:** `src/types/blog.ts`, `src/data/blogProfile.ts`, `src/data/blogs.ts`

**Depends On:** None

**Steps:**

1. 为 `BlogMeta` 增加 `category`、`updatedAt`、`pinned`、`readingMinutes` 和 `coverAlt` 可选字段。
2. 增加 `BlogFilterState`、`BlogArchive`、`BlogIndexStats`、`TocItem` 和 `BlogProfile` 类型。
3. 创建集中式博客配置，填写 Chblue 博客名称、简介、社交入口和资源路径。
4. 为现有本地文章补充合理的可选字段示例，保持原 slug 和必填字段不变。

**Verification:** 运行 `npx tsc --noEmit -p tsconfig.app.json`，预期退出码为 0；检查现有 `hello-world` 地址仍为 `/blog/hello-world`。

## T2: 实现文章索引与目录纯函数

**Files:** `src/utils/blog.ts`

**Depends On:** T1

**Steps:**

1. 实现不修改输入数组的日期倒序函数。
2. 实现标签、分类、归档和最近文章统计。
3. 实现组合搜索、标签、分类、月份筛选。
4. 实现默认每页 10 篇的分页和总页数计算。
5. 实现阅读时间估算。
6. 实现忽略代码围栏、支持重复标题的二级/三级标题提取和 slug 生成。
7. 为围栏识别、重复标题和混合中英文阅读时间添加必要注释。

**Verification:** 运行 `npx tsc --noEmit -p tsconfig.app.json`，预期退出码为 0；使用至少 11 条内存测试数据调用纯函数，确认第一页为 10 条、第二页为 1 条，组合筛选和重复标题 ID 结果正确。

## T3: 扩展 Notion 元数据映射

**Files:** `src/api/posts.ts`

**Depends On:** T1

**Steps:**

1. 增加安全的 select、rich text、date、checkbox 和 number 属性提取函数。
2. 在文章列表映射中读取 `Category`、`Updated`、`Pinned`、`ReadingTime` 和 `CoverAlt`。
3. 在单篇文章映射中使用相同规则。
4. 当属性不存在或类型不匹配时返回批准方案中的默认值，不抛出错误。
5. 保持现有必填属性、发布过滤和排序请求不变。

**Verification:** 运行 `npx tsc --noEmit -p tsconfig.app.json`，预期退出码为 0；在不新增 Notion 属性的现有数据库配置下调用列表和详情，预期旧文章仍可返回。

## T4: 统一文章加载 Hook

**Files:** `src/hooks/usePublishedPosts.ts`, `src/hooks/useBlogPost.ts`

**Depends On:** T1, T3

**Steps:**

1. 实现文章集合加载状态，初始保留本地集合并尝试远程替换。
2. 实现卸载保护，避免异步请求完成后更新已卸载组件。
3. 实现单篇文章远程优先、本地 frontmatter/Markdown 降级。
4. 明确返回 `loading`、`ready` 和 `not-found` 状态。
5. 暴露 `usingFallback`，但不向普通访客显示阻断式错误。

**Verification:** 运行 `npx tsc --noEmit -p tsconfig.app.json`，预期退出码为 0；分别在有效配置和临时移除 Vite Notion 环境变量的开发会话中检查文章集合与 `hello-world` 详情，预期两种情况下都有可用内容。

## T5: 实现页面 Meta 与章节监听 Hook

**Files:** `src/hooks/usePageMeta.ts`, `src/hooks/useActiveHeading.ts`

**Depends On:** T1

**Steps:**

1. 实现 title、description、Open Graph title/description/image 的创建或更新。
2. 在 Hook 清理阶段恢复进入页面前的 Meta 值。
3. 使用 `IntersectionObserver` 监听目录标题并维护当前章节。
4. 处理无目录、浏览器不支持 Observer 和组件卸载清理。

**Verification:** 运行 `npx tsc --noEmit -p tsconfig.app.json`，预期退出码为 0；在一个临时调用页面中切换 Meta 输入并卸载，确认 `document.title` 与 description 恢复，Observer 不可用时 Hook 不抛错。

## T6: 拆分作品集与博客路由布局

**Files:** `src/layouts/PortfolioLayout.tsx`, `src/layouts/BlogLayout.tsx`, `src/App.tsx`

**Depends On:** T1

**Steps:**

1. 将现有 Header、Outlet 和 Footer 移入 `PortfolioLayout`。
2. 创建带 `.blog-shell` 根节点、博客 Header、Outlet 和 Footer 的 `BlogLayout`。
3. 将首页和项目页放入作品集布局。
4. 将 `/blog` 与 `/blog/:slug` 放入博客布局，并保持页面组件懒加载。
5. 保持现有公开 URL 不变。

**Verification:** 运行 `npx tsc --noEmit -p tsconfig.app.json`，预期退出码为 0；启动开发服务器，访问 `/`、`/projects`、`/blog`、`/blog/hello-world`，确认四个地址均渲染且浏览器无路由错误。

## T7: 实现博客专属导航

**Files:** `src/components/blog/BlogHeader.tsx`, `src/layouts/BlogLayout.tsx`

**Depends On:** T6

**Steps:**

1. 实现作品集首页、博客首页、分类、标签、关于和主题切换入口。
2. 实现 Hero 顶部透明状态与滚动后的固定实色状态。
3. 实现带 `aria-expanded`、`aria-controls` 的移动菜单。
4. 路由变化后关闭移动菜单。
5. 处理从文章详情跳转到博客首页筛选区域的锚点导航。

**Verification:** 启动开发服务器，在 1440px 与 390px 视口下操作导航；预期滚动样式切换、移动菜单展开/收起、返回作品集和主题切换均正常，并可只用键盘完成操作。

## T8: 准备原创 Hero 视觉并实现博客首屏

**Files:** `public/images/blog/blog-hero.webp`, `src/components/blog/BlogHero.tsx`, `src/data/blogProfile.ts`

**Depends On:** T1, T6

**Steps:**

1. 使用原创或明确授权的深色开发者主题视觉，画面采用蓝青到紫色光线、无文字、适合宽屏裁切，不使用参考站素材。
2. 输出至少 1600×900 的 WebP 文件，并控制网页资源体积。
3. 实现封面图片、遮罩、站点名称、副标题、社交入口和下滑按钮。
4. 为图片失败状态实现渐变降级，不隐藏站点信息。
5. 首屏图使用高优先级加载，装饰信息不重复进入可访问名称。

**Verification:** 检查 `blog-hero.webp` 尺寸不低于 1600×900 且文件可被浏览器直接打开；访问 `/blog`，确认首屏覆盖主要视口、文字清晰、下滑按钮能定位到文章区域；模拟图片 404 后仍显示完整渐变首屏。

## T9: 实现筛选、文章卡片与分页组件

**Files:** `src/components/blog/BlogFilters.tsx`, `src/components/blog/PostCard.tsx`, `src/components/blog/BlogPagination.tsx`

**Depends On:** T1, T2

**Steps:**

1. 实现带可见标签的搜索输入、标签/分类按钮、结果数量和重置操作。
2. 实现文章封面、标题、摘要、日期、标签及可选元数据。
3. 用 `imageSide` 控制桌面图文方向，并保证移动端统一图片在上。
4. 为首张卡片和其余卡片设置不同图片加载优先级。
5. 实现上一页、页码和下一页，使用 `aria-current` 标识当前页。
6. 图片失败时显示稳定的渐变占位。

**Verification:** 运行 `npx tsc --noEmit -p tsconfig.app.json`，预期退出码为 0；用多篇测试数据渲染组件，确认交错方向、可选字段、图片失败、重置筛选和当前页语义正确。

## T10: 实现博客信息侧栏

**Files:** `src/components/blog/BlogSidebar.tsx`

**Depends On:** T1, T2

**Steps:**

1. 实现作者头像/文字降级、简介、文章数和社交入口。
2. 实现最近文章链接。
3. 仅在有数据时渲染分类、标签云和月份归档。
4. 将侧栏筛选操作统一回传完整 `BlogFilterState`。
5. 为当前筛选条件提供文字或可访问状态，不只改变颜色。

**Verification:** 使用同时包含完整元数据和缺少分类的两组测试数据；预期完整数据展示全部卡片，缺失数据不展示空区块，所有文章及筛选入口均可点击。

## T11: 重构博客首页编排

**Files:** `src/pages/BlogPage.tsx`

**Depends On:** T4, T5, T8, T9, T10

**Steps:**

1. 组合 `BlogHero`、文章加载 Hook、派生统计、筛选、分页和侧栏。
2. 将筛选源设为完整文章集合，将分页源设为筛选后的集合。
3. 每次筛选变化时重置页码为 1。
4. 分页后将文章区域滚动回可见位置，并尊重减少动态效果偏好。
5. 实现加载、无文章和无匹配结果状态。
6. 设置博客首页 Meta，并为筛选区提供分类和标签锚点。

**Verification:** 启动开发服务器并使用至少 11 篇测试文章；确认日期倒序、组合筛选、10 篇分页、侧栏统计不随筛选错误变化、无结果重置以及下滑/切页定位均符合规格。

## T12: 实现文章详情 Hero

**Files:** `src/components/blog/ArticleHero.tsx`

**Depends On:** T1, T2, T8

**Steps:**

1. 展示封面、标题、发布日期、标签和返回博客入口。
2. 按存在性展示更新时间、分类和阅读时间。
3. 使用比博客首页更短的 Hero 高度，使正文在下缘可见。
4. 复用封面失败渐变降级和可访问替代文本规则。

**Verification:** 分别渲染完整元数据与只有必填字段的文章；预期可选信息按存在性显示，两种情况下布局完整且返回入口有效。

## T13: 实现目录与代码块组件

**Files:** `src/components/blog/ArticleToc.tsx`, `src/components/blog/MarkdownCodeBlock.tsx`

**Depends On:** T1, T2, T5

**Steps:**

1. 实现二级/三级目录缩进、当前章节状态和原生锚点链接。
2. 实现移动端可展开目录，并维护展开按钮语义。
3. 实现行内代码与围栏代码分支。
4. 为围栏代码显示语言名称、语法高亮、复制按钮和 `aria-live` 反馈。
5. 处理 Clipboard API 失败，不阻断代码选择和阅读。

**Verification:** 使用包含重复标题、二三级标题、行内代码和 JavaScript 围栏代码的文章；确认目录 ID 唯一、跳转正确、当前章节可更新、复制成功和失败均有反馈，无标题文章不显示目录。

## T14: 重构 Markdown 正文与目录布局

**Files:** `src/components/BlogDetail.tsx`

**Depends On:** T2, T5, T13

**Steps:**

1. 删除文件中已注释的旧实现，保留单一有效组件。
2. 一次提取目录数据，并建立 Markdown 行号到标题 ID 的映射。
3. 使用 `react-markdown` 自定义 `h2`、`h3`、`code`、`a` 和 `img`。
4. 保留 `remark-gfm` 以支持表格、任务列表和自动链接。
5. 外部链接安全新开，内部链接保持当前标签页。
6. 正文图片增加 lazy、async 和失败时不破坏布局的处理。
7. 组合桌面 sticky 目录与移动折叠目录。

**Verification:** 用现有文章及一篇覆盖表格、图片、链接、引用、列表、重复标题和代码的测试 Markdown 访问详情；预期所有内容正确渲染，无横向溢出，目录与标题 ID 一致。

## T15: 重构文章详情页面状态与评论编排

**Files:** `src/pages/BlogPostPage.tsx`

**Depends On:** T4, T5, T12, T14

**Steps:**

1. 使用 `useBlogPost` 替换页面内部重复加载与 fallback 函数。
2. 为加载状态渲染博客风格占位。
3. 为未找到状态渲染说明和返回博客入口，不再静默重定向。
4. 根据正文或元数据计算阅读时间。
5. 组合 `ArticleHero`、`BlogDetail` 和现有 `CommentSection`。
6. 设置文章 title、description、Open Graph image，并确保离开时恢复。

**Verification:** 访问 `/blog/hello-world`、一个不存在的 slug 和远程文章 slug；预期分别显示正常详情、可理解的未找到页和远程详情，评论区仍在正文后，离开文章后页面标题恢复。

## T16: 完成博客视觉系统与响应式样式

**Files:** `src/index.css`

**Depends On:** T7, T8, T9, T10, T12, T13, T14, T15

**Steps:**

1. 在 `.blog-shell` 下增加博客浅色和深色变量，深色背景以 `#0a0a0a` 为基准。
2. 实现 Hero、导航、文章卡片、侧栏、正文卡片、目录、代码工具栏和状态页面样式。
3. 为 768px 与 1024px 边界实现单列、中间态和双栏布局。
4. 增加统一 `focus-visible` 样式。
5. 增加 `prefers-reduced-motion` 覆盖，关闭位移、缩放和非必要平滑滚动。
6. 确保博客作用域规则不覆盖作品集现有页面。

**Verification:** 在 390×844、768×1024、1440×1100 视口下检查 `/blog` 与 `/blog/hello-world`；预期无非预期横向滚动、文本遮挡和不可操作入口，明暗主题均清晰，首页视觉未变化。

## T17: 统一首页最近文章并清理旧组件

**Files:** `src/components/LatestPosts.tsx`, `src/components/BlogCard.tsx`, `src/components/BlogList.tsx`

**Depends On:** T4, T11

**Steps:**

1. 让 `LatestPosts` 使用 `usePublishedPosts` 和统一日期排序函数。
2. 保持作品集首页当前视觉，仅替换重复数据加载逻辑。
3. 确认新博客首页不再引用旧 `BlogCard`、`BlogList`。
4. 删除两个未使用的旧组件。

**Verification:** 运行源码引用搜索，预期不存在对旧 `BlogCard` 或 `BlogList` 的引用；访问首页确认最近文章仍显示并可进入详情；运行 `npx tsc --noEmit -p tsconfig.app.json` 预期退出码为 0。

## T18: 运行静态验证并修复问题

**Files:** 所有本次修改的 TypeScript、TSX 和 CSS 文件

**Depends On:** T1–T17

**Steps:**

1. 运行 ESLint，修复新增警告和错误。
2. 运行 TypeScript 与生产构建，修复类型和打包问题。
3. 检查构建输出中没有新增的未解析资源和明显异常体积。
4. 检查 Git diff，确保未包含环境变量、缓存、临时测试数据或参考站受版权保护素材。

**Verification:** `npm run lint` 和 `npm run build` 均以退出码 0 完成；`git diff --check` 无输出；`git status --short` 只列出预期文件。

## T19: 完成端到端与多视口验收预检

**Files:** 无新增文件；仅在发现问题时修改对应实现文件

**Depends On:** T18

**Steps:**

1. 从作品集首页进入博客首页，再进入文章详情、操作目录、代码复制和评论区，最后返回博客及作品集。
2. 验证搜索、标签、分类、归档、重置、分页和无结果流程。
3. 验证明暗主题、刷新持久化、移动菜单和减少动态效果。
4. 验证远程内容、本地降级、文章未找到和图片失败状态。
5. 在 390px、768px、1440px 三种宽度保存页面截图供 `checklist.md` 验收对照。

**Verification:** 上述完整流程在三种视口均可完成，浏览器控制台无新增运行时错误，关键截图能清楚证明布局、导航和响应式行为。

## Execution Order

```text
T1
├── T2
├── T3 -> T4
├── T5
└── T6 -> T7

T6 + T1 -> T8
T2 -> T9 -> T11
T2 -> T10 -> T11
T2 + T8 -> T12
T2 + T5 -> T13 -> T14
T4 + T5 + T12 + T14 -> T15
T7 + T8 + T9 + T10 + T12 + T13 + T14 + T15 -> T16
T4 + T11 -> T17
T1-T17 -> T18 -> T19
```

