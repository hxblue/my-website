# Butterfly 风格博客改版 Plan

## Architecture Overview

本次改版保留现有 React 单页应用、文章路由、Notion 内容源、本地 Markdown 降级和 Supabase 评论系统。实现重点是将作品集外壳与博客外壳拆开，并在博客外壳内部建立可复用的首页、侧栏和文章阅读组件。

路由结构采用两个并列布局：

```text
BrowserRouter
├── PortfolioLayout
│   ├── /                  -> HomePage
│   └── /projects          -> Projects
└── BlogLayout
    ├── /blog              -> BlogPage
    └── /blog/:slug        -> BlogPostPage
```

- `PortfolioLayout` 继续渲染当前全局 Header、页面内容和 Footer，避免博客改版影响作品集页面。
- `BlogLayout` 渲染博客专属导航、博客页面出口和统一页脚，并继承现有主题上下文。
- `/blog` 负责文章集合、搜索筛选、分页、首页首屏和侧栏。
- `/blog/:slug` 负责文章获取、未找到状态、文章头部、Markdown 正文、目录和评论。

整体数据流：

```text
Notion API ─┐
            ├─> 文章加载 Hook ─> 统一 BlogMeta / BlogPost ─> 页面派生数据 ─> UI
本地文章 ───┘

Markdown 正文 ─> 标题提取 ─> 标题 ID 映射 ─> 正文渲染 + 目录监听
```

## Core Data Structures

### BlogMeta

保留现有必填字段，并增加可选元数据。旧文章不需要补齐这些字段。

```ts
export interface BlogMeta {
  slug: string;
  title: string;
  date: string;
  cover: string;
  tags: string[];
  excerpt: string;
  category?: string;
  updatedAt?: string;
  pinned?: boolean;
  readingMinutes?: number;
  coverAlt?: string;
}
```

- `category`：文章主分类，区别于可多选标签。
- `updatedAt`：最近更新时间；缺失时不显示更新信息。
- `pinned`：仅控制置顶标识展示，不改变已批准规格中的日期倒序规则。
- `readingMinutes`：优先使用内容源提供的值；详情加载后缺失时根据正文估算。
- `coverAlt`：封面替代文本；缺失时使用文章标题。

### BlogPost

```ts
export interface BlogPost extends BlogMeta {
  content: string;
}
```

### BlogFilterState

使用 `null` 表示未选中条件，避免依赖“全部”等界面文案作为业务状态。

```ts
export interface BlogFilterState {
  query: string;
  tag: string | null;
  category: string | null;
  archiveMonth: string | null;
}
```

`archiveMonth` 使用 `YYYY-MM` 格式。

### BlogArchive

```ts
export interface BlogArchive {
  key: string;      // YYYY-MM
  label: string;    // 本地化月份文案
  count: number;
}
```

### BlogIndexStats

```ts
export interface BlogIndexStats {
  postCount: number;
  tagCounts: Record<string, number>;
  categoryCounts: Record<string, number>;
  archives: BlogArchive[];
  recentPosts: BlogMeta[];
}
```

### TocItem

```ts
export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
  line: number;
}
```

`line` 对应 Markdown 源文本行号，用来保证目录 ID 和 `react-markdown` 自定义标题组件生成的 ID 一致。

### BlogProfile

```ts
export interface BlogProfile {
  name: string;
  description: string;
  avatar: string;
  heroImage: string;
  heroAlt: string;
  socialLinks: Array<{
    label: string;
    href: string;
  }>;
}
```

博客名称、作者介绍、头像、首屏图和社交链接集中配置，不散落在多个组件中。

## Core Interfaces And Functions

### 文章集合加载

```ts
type LoadStatus = 'loading' | 'ready';

interface PublishedPostsState {
  posts: BlogMeta[];
  status: LoadStatus;
  usingFallback: boolean;
}

function usePublishedPosts(): PublishedPostsState;
```

行为：

1. 初始以本地文章作为安全数据，同时显示加载状态。
2. 远程文章返回非空集合后替换本地集合。
3. 远程请求失败、未配置或返回空集合时保留本地文章。
4. 组件卸载后不再提交状态更新。

`BlogPage` 与首页的 `LatestPosts` 共同使用该 Hook，消除重复加载逻辑。

### 单篇文章加载

```ts
interface BlogPostState {
  post: BlogPost | null;
  status: 'loading' | 'ready' | 'not-found';
  usingFallback: boolean;
}

function useBlogPost(slug: string | undefined): BlogPostState;
```

行为：优先加载远程文章，远程不可用或未命中时查找本地元数据和 Markdown；两者都不存在时返回 `not-found`，不再静默重定向。

### 文章索引派生

```ts
function sortPostsByDate(posts: BlogMeta[]): BlogMeta[];
function buildBlogIndexStats(posts: BlogMeta[]): BlogIndexStats;
function filterPosts(posts: BlogMeta[], filters: BlogFilterState): BlogMeta[];
function paginatePosts(posts: BlogMeta[], page: number, pageSize?: number): BlogMeta[];
function getPageCount(total: number, pageSize?: number): number;
```

- `sortPostsByDate` 不原地修改调用方数组。
- `filterPosts` 对查询文字做 trim 和小写标准化，并组合查询、标签、分类及月份条件。
- 页面大小默认值为 10。
- 筛选状态变化时由页面将页码重置为 1。

### 阅读时间

```ts
function estimateReadingMinutes(markdown: string): number;
```

计算时移除代码围栏和 Markdown 标记，并按中文字符数与英文单词数估算；最小返回 1。内容源已经提供 `readingMinutes` 时不重新计算。

### 目录提取与标题 ID

```ts
function extractMarkdownHeadings(markdown: string): TocItem[];
function slugifyHeading(text: string): string;
function useActiveHeading(items: TocItem[]): string | null;
```

- 仅收集二级和三级标题。
- 提取时忽略代码围栏中的伪标题。
- 重复标题通过顺序后缀生成唯一 ID。
- 自定义 `h2`、`h3` 渲染组件使用 `react-markdown` 提供的 `node.position.start.line` 查找相同 `TocItem.id`。
- `useActiveHeading` 使用 `IntersectionObserver` 更新当前章节；浏览器不支持时目录仍可点击，只是不显示滚动高亮。

根据 Context7 核对，当前 `react-markdown` 支持通过 `components` 覆盖标题、代码和链接渲染，也支持读取节点位置信息以及组合 `remarkPlugins`。因此目录设计继续使用现有 `remark-gfm`，无需新增 Markdown 依赖。

### 页面元信息

```ts
interface PageMetaInput {
  title: string;
  description: string;
  image?: string;
}

function usePageMeta(input: PageMetaInput): void;
```

该 Hook 更新 `document.title`、description、Open Graph 标题/描述/图片，并在组件卸载时恢复之前的值，防止文章信息污染其他页面。

## Module Design

### PortfolioLayout

**Responsibility:** 承载现有作品集 Header、Outlet 和 Footer。

**Public Interface:** 无 props，由路由渲染。

**Dependencies:** `Header`、`Footer`、React Router `Outlet`。

### BlogLayout

**Responsibility:** 承载博客专属导航、Outlet、博客页脚和博客作用域样式根节点。

**Public Interface:** 无 props，由路由渲染。

**Dependencies:** `BlogHeader`、`Footer`、主题上下文、React Router `Outlet`。

### BlogHeader

**Responsibility:** 博客导航、移动菜单、滚动状态和主题切换。

**Behavior:**

- 通过当前路由判断是否覆盖在首页 Hero 或文章 Hero 上。
- 监听最小必要滚动状态，切换透明/实色样式。
- 路由变化后关闭移动菜单。
- “分类”和“标签”在博客首页触发滚动到筛选区；从文章页点击时导航到带目标锚点的博客首页。
- 提供返回作品集首页入口。

### BlogHero

**Responsibility:** 首页沉浸式封面、站点信息、社交入口和下滑按钮。

**Public Interface:**

```ts
interface BlogHeroProps {
  profile: BlogProfile;
  contentTargetId: string;
}
```

封面使用独立图片元素和渐变遮罩。首屏图优先加载；图片失败时显示博客渐变背景。下滑按钮在减少动态效果模式下使用即时定位。

### BlogPage

**Responsibility:** 组合文章集合、搜索筛选、分页、文章流和侧栏。

**State:**

- `filters: BlogFilterState`
- `page: number`

**Dependencies:** `usePublishedPosts`、博客派生函数、`PostCard`、`BlogSidebar`、`BlogPagination`。

页面使用 `useMemo` 依次执行排序、统计、筛选和分页，避免每个侧栏组件各自重复计算。

### BlogFilters

**Responsibility:** 搜索输入、当前条件展示和清空操作。

**Public Interface:**

```ts
interface BlogFiltersProps {
  value: BlogFilterState;
  tags: string[];
  categories: string[];
  resultCount: number;
  onChange(next: BlogFilterState): void;
  onReset(): void;
}
```

标签和分类使用真实按钮元素。输入框具有可见标签，当前条件不只依赖颜色表达。

### PostCard

**Responsibility:** 渲染一篇文章的封面、元数据和摘要。

**Public Interface:**

```ts
interface PostCardProps {
  post: BlogMeta;
  imageSide: 'left' | 'right';
  eager?: boolean;
}
```

桌面端根据文章在当前结果页中的索引交错图片方向；移动端忽略方向。首张可视文章可以 eager，其余封面 lazy。

### BlogSidebar

**Responsibility:** 作者卡、统计、最近文章、分类、标签云和归档的组合容器。

**Public Interface:**

```ts
interface BlogSidebarProps {
  profile: BlogProfile;
  stats: BlogIndexStats;
  filters: BlogFilterState;
  onFilterChange(next: BlogFilterState): void;
}
```

内部重复视觉结构使用轻量 `SidebarCard`，但不为每一行数据创建独立组件。无数据的分类、标签或归档区块不渲染。

### BlogPagination

**Responsibility:** 页码、上一页和下一页操作。

**Public Interface:**

```ts
interface BlogPaginationProps {
  page: number;
  pageCount: number;
  onPageChange(page: number): void;
}
```

页数为 1 时不渲染。切页后由 `BlogPage` 将文章区域滚动到可见位置。

### BlogPostPage

**Responsibility:** 根据 slug 加载文章，协调加载、未找到、详情和评论状态。

**Dependencies:** `useBlogPost`、`ArticleHero`、`BlogDetail`、`CommentSection`、`usePageMeta`。

未找到状态为可访问的页面内容，包含说明和返回入口，不使用无提示重定向。

### ArticleHero

**Responsibility:** 展示文章封面、标题、日期、更新时间、分类、标签和阅读时间。

**Public Interface:**

```ts
interface ArticleHeroProps {
  post: BlogPost;
  readingMinutes: number;
}
```

Hero 高度小于博客首页首屏，保证正文能在首屏下缘露出。封面失败时使用与首页一致的渐变降级。

### BlogDetail

**Responsibility:** Markdown 渲染、正文布局、目录和内容内链接处理。

**Public Interface:**

```ts
interface BlogDetailProps {
  post: BlogPost;
}
```

正文与目录共享一次 `extractMarkdownHeadings` 结果。桌面采用“正文卡片 + sticky 目录”布局，移动端目录置于正文前并可折叠。

### MarkdownCodeBlock

**Responsibility:** 区分行内代码与围栏代码，渲染语法高亮、语言标签和复制反馈。

**Public Interface:**

```ts
interface MarkdownCodeBlockProps {
  className?: string;
  children: React.ReactNode;
}
```

复制使用 `navigator.clipboard.writeText`，失败时提供文本反馈；反馈区域使用 `aria-live`。

### ArticleToc

**Responsibility:** 渲染目录和当前章节状态。

**Public Interface:**

```ts
interface ArticleTocProps {
  items: TocItem[];
  activeId: string | null;
}
```

没有条目时返回 `null`。目录链接保留原生锚点语义，JavaScript 不可用时仍可跳转。

### usePageMeta

**Responsibility:** 统一管理博客首页和文章详情的页面标题、描述和 Open Graph 信息，并负责清理。

### Blog Utilities

**Responsibility:** 排序、筛选、统计、分页、阅读时间、月份格式化、标题提取和 slug 生成。

纯函数集中放置，页面只负责状态协调。对目录提取、远程降级和重复标题 ID 等非直观逻辑添加说明性注释。

## Module Interactions

### 博客首页流程

```text
BlogLayout
  -> BlogHeader
  -> BlogPage
       -> BlogHero
       -> usePublishedPosts
            -> getPublishedPosts
            -> fallbackBlogs
       -> sortPostsByDate
       -> buildBlogIndexStats
       -> filterPosts
       -> paginatePosts
       -> BlogFilters
       -> PostCard[]
       -> BlogPagination
       -> BlogSidebar
```

侧栏点击标签、分类或月份后，将标准化过滤条件回传 `BlogPage`。`BlogPage` 重置页码、更新结果，并滚动到文章区域。

### 文章详情流程

```text
BlogLayout
  -> BlogHeader
  -> BlogPostPage
       -> useBlogPost(slug)
            -> getPostBySlug
            -> fallback metadata + Markdown
       -> usePageMeta
       -> ArticleHero
       -> BlogDetail
            -> extractMarkdownHeadings
            -> ReactMarkdown + remarkGfm
            -> MarkdownCodeBlock
            -> ArticleToc + useActiveHeading
       -> CommentSection
```

### 主题流程

```text
ThemeProvider
  -> PortfolioLayout / BlogLayout
  -> ThemeToggle
  -> root .dark class + persisted localStorage value
  -> scoped CSS variables update every blog component
```

不创建第二套主题状态，避免博客与作品集切换时主题不同步。

## File Organization

```text
src/
  App.tsx
    - 将现有全局布局拆为 PortfolioLayout 与 BlogLayout 路由

  layouts/
    PortfolioLayout.tsx
      - 现有作品集 Header、Outlet、Footer
    BlogLayout.tsx
      - 博客专属 Header、Outlet、Footer 和作用域根节点

  components/
    blog/
      BlogHeader.tsx
        - 透明/固定导航和移动菜单
      BlogHero.tsx
        - 博客首页首屏
      BlogFilters.tsx
        - 搜索、标签、分类和重置
      PostCard.tsx
        - 交错文章卡片
      BlogSidebar.tsx
        - 作者、统计、最近文章、分类、标签、归档
      BlogPagination.tsx
        - 分页控件
      ArticleHero.tsx
        - 文章详情封面头部
      ArticleToc.tsx
        - 桌面和移动目录
      MarkdownCodeBlock.tsx
        - 代码高亮、语言和复制反馈
    BlogDetail.tsx
      - 重构为正文、目录和 Markdown 渲染容器

  hooks/
    usePublishedPosts.ts
      - 文章集合远程优先、本地降级
    useBlogPost.ts
      - 单篇文章远程优先、本地降级和未找到状态
    useActiveHeading.ts
      - IntersectionObserver 章节跟踪
    usePageMeta.ts
      - 标题、描述和 Open Graph 元信息

  data/
    blogProfile.ts
      - 博客作者、Hero 和社交配置
    blogs.ts
      - 扩展可选元数据但保留现有文章

  types/
    blog.ts
      - BlogMeta、BlogPost、筛选、统计、目录和作者类型

  utils/
    blog.ts
      - 排序、筛选、分页、统计、阅读时间和目录纯函数

  pages/
    BlogPage.tsx
      - 重构博客首页编排
    BlogPostPage.tsx
      - 重构详情加载、错误、Meta、正文和评论编排

  api/
    posts.ts
      - 映射可选的 Notion Category、Updated、Pinned、ReadingTime、CoverAlt

  index.css
    - 增加作用域博客变量、Hero、卡片、目录、代码块、响应式与 reduced-motion

public/
  images/blog/
    blog-hero.webp
      - 原创或已授权的博客首屏素材；缺失时使用渐变降级
    avatar.webp
      - 博客作者头像；缺失时使用文字头像降级
```

现有未被其他模块引用的 `src/components/BlogCard.tsx` 和 `src/components/BlogList.tsx` 在新组件稳定后删除，避免保留两套文章列表实现。

## Styling Design

### Scoped Tokens

在 `.blog-shell` 下定义博客特有变量，并让 `.dark .blog-shell` 覆盖深色值：

```text
--blog-bg
--blog-surface
--blog-surface-elevated
--blog-text
--blog-muted
--blog-border
--blog-accent-start
--blog-accent-end
--blog-overlay
--blog-shadow
```

- 深色默认背景以 `#0a0a0a` 为基准。
- 强调色使用蓝青到紫色的渐变，不复制参考站品牌色。
- 卡片圆角、边框和阴影保持克制，主要依靠封面和间距建立层级。
- 博客变量仅作用于 `.blog-shell`，不改变作品集现有颜色变量。

### Responsive Breakpoints

- `< 768px`：单列文章卡片、折叠导航、折叠目录、侧栏移至列表后。
- `768px–1023px`：文章卡片可交错，但首页保持单主栏，侧栏改为底部网格。
- `>= 1024px`：文章主栏与约 300px 侧栏；文章详情为正文与目录两栏。

### Motion

- 仅使用 CSS opacity、transform 和颜色过渡。
- 导航状态切换不改变页面几何尺寸，避免布局跳动。
- `prefers-reduced-motion: reduce` 下关闭卡片位移、封面缩放和非必要平滑滚动。
- 不引入 Framer Motion、Canvas 或持续运行的动画循环。

## Data Source Mapping

Notion 属性采用存在即读取的可选映射：

| Blog field | Notion property | Supported type | Fallback |
| --- | --- | --- | --- |
| `category` | `Category` | select / rich_text | `undefined` |
| `updatedAt` | `Updated` | date | `undefined` |
| `pinned` | `Pinned` | checkbox | `false` |
| `readingMinutes` | `ReadingTime` | number | 详情页按正文估算 |
| `coverAlt` | `CoverAlt` | rich_text | 文章标题 |

现有 `Name`、`Slug`、`Date`、`Cover`、`Tags`、`Excerpt` 和 `Published` 映射保持不变。新增属性不存在时不抛出错误。

本地 Markdown frontmatter 使用同名可选字段，旧 Markdown 无需修改。

## Error And Fallback Design

- 文章集合加载失败：保留本地集合，不显示阻断式错误。
- 单篇远程文章失败：尝试本地 Markdown；仍未命中后显示未找到页面。
- Hero 或封面失败：隐藏失败图片，展示渐变背景和文字替代信息。
- 头像失败：展示作者名称首字符组成的文字头像。
- Clipboard API 失败：代码仍可选择，并显示“复制失败，请手动复制”。
- IntersectionObserver 不可用：目录链接继续工作，只关闭章节自动高亮。
- 无分类、标签或归档：不显示对应空侧栏卡片。
- 无文章：保留 Hero、作者信息和明确的空内容提示。

## Accessibility Design

- 交互元素使用 `button`、`a`、`nav`、`main`、`article`、`aside` 等原生语义。
- 移动菜单按钮维护 `aria-expanded` 和 `aria-controls`。
- 当前分页、筛选和目录章节分别提供 `aria-current` 或文字状态。
- 复制结果通过 `aria-live="polite"` 宣布。
- Hero 背景不承载唯一信息；装饰图片使用空 alt，内容封面使用 `coverAlt`。
- 标题层级保持单个页面主标题，正文从二级标题开始建立目录。
- 所有 focus-visible 状态在明暗主题下达到可识别对比度。

## Performance Design

- 首页 Hero 图片使用高优先级加载；卡片首张按视口需要加载，其余 `loading="lazy"` 和 `decoding="async"`。
- 文章正文图片由 Markdown 图片组件统一添加 lazy 和 async。
- Hero、头像和本地封面优先采用 WebP；外部图片保留原 URL 并提供失败降级。
- 页面级 BlogPage 和 BlogPostPage 继续使用现有懒加载路由。
- 统计、筛选、分页和目录列表使用 memoized 派生结果，不存储重复状态。
- 不新增运行时动画库和 Markdown 插件依赖。

## Technical Decisions

| Decision | Choice | Reason |
| --- | --- | --- |
| 博客框架 | 保留 React，不迁移 Hexo | 复用现有路由、Notion、Markdown、主题和评论能力，避免双构建系统 |
| 路由外壳 | PortfolioLayout 与 BlogLayout 并列 | 隔离博客视觉，又不改变公开 URL |
| 文章排序 | 始终按发布日期倒序，置顶只显示标识 | 与已批准 F4、AC4 保持一致 |
| 筛选状态 | 页面本地状态 | 当前规格不要求分享筛选 URL，保持实现简单 |
| 分页 | 客户端分页，每页 10 篇 | 当前数据已在前端获取，符合规格且无需新后端接口 |
| 侧栏统计 | 从完整文章集合派生 | 防止统计被当前筛选或分页错误影响 |
| 目录生成 | 源 Markdown 行号 + 自定义标题组件 | 保证 ID 一致，支持重复标题且不新增依赖 |
| Markdown | 保留 react-markdown + remark-gfm | 现有功能可覆盖表格、链接和代码扩展 |
| 代码复制 | 封装 MarkdownCodeBlock | 独立管理复制状态、语言标签和可访问反馈 |
| 主题 | 复用 ThemeProvider | 保持刷新与跨路由主题一致，不创建冲突状态 |
| 动画 | CSS + IntersectionObserver | 体积小，可尊重 reduced-motion，不需要动画库 |
| 缺失素材 | 渐变和文字头像降级 | 视觉资产未准备时页面仍完整可用 |
| 页面 Meta | 本地 usePageMeta Hook | 当前 SPA 无需引入完整 head 管理依赖 |
| 测试策略 | 现有 lint/build + 浏览器行为与多视口验收 | 项目尚无测试运行器，本次不为视觉改版额外引入测试框架 |

## Requirement Coverage

| Spec requirement | Plan coverage |
| --- | --- |
| F1 | 双布局路由、PortfolioLayout、BlogLayout |
| F2 | BlogHero、图片降级、下滑目标 |
| F3 | BlogHeader、滚动状态、移动菜单 |
| F4 | PostCard、日期排序、交错布局 |
| F5 | BlogFilterState、BlogFilters、filterPosts |
| F6 | BlogPagination、默认 10 篇、筛选重置页码 |
| F7 | BlogSidebar、BlogIndexStats、响应式侧栏 |
| F8 | ArticleHero、元数据和封面降级 |
| F9 | BlogDetail、MarkdownCodeBlock、自定义链接和图片 |
| F10 | TocItem、标题提取、ArticleToc、useActiveHeading |
| F11 | BlogPostPage 保留 CommentSection |
| F12 | 复用 ThemeProvider、博客作用域主题变量 |
| F13 | usePublishedPosts、useBlogPost、未找到和图片降级 |
| F14 | usePageMeta 与清理逻辑 |
| N1 | 三档响应式布局 |
| N2 | 图片加载策略、无新动画运行时依赖、memoized 派生 |
| N3 | 原生语义、ARIA、焦点、reduced-motion |
| N4 | 可选字段、原路由、远程/本地兼容 |
| N5 | 独立布局、组件职责、作用域样式和纯工具函数 |

