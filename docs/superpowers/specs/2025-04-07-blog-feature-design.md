# 博客功能设计方案

## 概述
在现有 portfolio 网站中添加博客系统，用于分享学习经验和技术文章。

## 技术选型

| 方面 | 方案 |
|------|------|
| 内容格式 | Markdown 文件 |
| 存储位置 | `src/posts/` 目录 + Git 版本控制 |
| 路由方案 | React Router，独立页面 `/blog` 和 `/blog/:slug` |
| 列表布局 | 卡片网格（复用 Projects 风格） |
| Markdown 解析 | `gray-matter` + `react-markdown` |
| 代码高亮 | `react-syntax-highlighter` |

## 文章格式

每篇文章是一个 Markdown 文件，头部包含 YAML Front Matter：

```yaml
---
title: "文章标题"
date: "2025-04-07"
cover: "/images/blog-covers/xxx.jpg"
tags: ["标签1", "标签2"]
---

文章内容使用 Markdown 格式...
```

## 文件结构

```
src/
├── components/
│   ├── BlogCard.tsx      # 博客卡片组件
│   ├── BlogList.tsx      # 博客网格列表
│   └── BlogPost.tsx      # 文章详情页
├── data/
│   ├── blogs.ts          # 博客元数据索引
│   └── posts/            # Markdown 文章目录
│       └── hello-world.md
├── pages/
│   └── BlogPage.tsx      # /blog 路由页面
├── utils/
│   └── markdown.ts       # Markdown 解析工具
└── App.tsx               # 修改：添加路由配置

public/
└── images/
    └── blog-covers/      # 博客封面图
```

## 导航调整

Header 组件添加 "博客" 导航链接，与现有 "关于"、"项目"、"联系" 并列：

```typescript
const navLinks = [
  { name: '关于', href: '#about' },
  { name: '项目', href: '#projects' },
  { name: '博客', href: '/blog' },    // 新增
  { name: '联系', href: '#contact' },
]
```

## 路由设计

```typescript
// 路由配置
/              -> 首页 (Hero + About + Projects + Contact)
/blog          -> 博客列表页
/blog/:slug    -> 单篇文章详情页
```

## 发布流程

1. 在 `src/data/posts/` 创建 `.md` 文件
2. 封面图放 `public/images/blog-covers/`
3. 更新 `src/data/blogs.ts` 索引
4. `git commit && git push`
5. Vercel 自动构建部署

## 组件设计

### BlogCard
- Props: `BlogMeta`（标题、日期、封面、标签、摘要、slug）
- 样式：复用 Projects 卡片风格，hover 动画效果
- 点击跳转 `/blog/:slug`

### BlogList
- Props: `blogs: BlogMeta[]`
- 布局：响应式网格（1列/2列/3列）
- 功能：按日期倒序排列

### BlogPost
- Props: `slug: string`
- 功能：
  - 根据 slug 查找对应文章
  - 解析 Markdown 渲染内容
  - 代码块语法高亮
  - 返回博客列表链接

## 依赖项

```json
{
  "dependencies": {
    "react-router-dom": "^6.x",
    "gray-matter": "^4.x",
    "react-markdown": "^9.x",
    "react-syntax-highlighter": "^15.x",
    "@types/react-syntax-highlighter": "^15.x"
  }
}
```

## 数据结构

```typescript
// src/data/blogs.ts
interface BlogMeta {
  slug: string;           // 唯一标识，对应文件名
  title: string;          // 文章标题
  date: string;           // 发布日期 (ISO 格式)
  cover: string;          // 封面图路径
  tags: string[];         // 标签列表
  excerpt: string;        // 摘要/简介
}

// 解析后的文章数据
interface BlogPost extends BlogMeta {
  content: string;        // Markdown 内容
}
```
