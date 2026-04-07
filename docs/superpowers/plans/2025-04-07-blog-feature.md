# 博客功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 portfolio 网站中添加 Markdown 博客系统，包含博客列表页和文章详情页

**Architecture:** 使用 react-router-dom 添加 `/blog` 和 `/blog/:slug` 路由。Markdown 文章存储在 `src/data/posts/`，通过 `gray-matter` 解析元数据，`react-markdown` 渲染内容。博客列表使用卡片网格布局，复用现有 Projects 组件风格。

**Tech Stack:** React Router, gray-matter, react-markdown, react-syntax-highlighter

---

## 文件结构映射

| 文件 | 职责 |
|------|------|
| `src/data/blogs.ts` | 博客元数据索引数组 |
| `src/data/posts/*.md` | Markdown 文章文件 |
| `src/types/blog.ts` | TypeScript 类型定义 |
| `src/utils/markdown.ts` | Markdown 解析工具函数 |
| `src/components/BlogCard.tsx` | 博客卡片组件 |
| `src/components/BlogList.tsx` | 博客网格列表组件 |
| `src/components/BlogDetail.tsx` | 文章详情渲染组件 |
| `src/pages/BlogPage.tsx` | /blog 列表页面 |
| `src/pages/BlogPostPage.tsx` | /blog/:slug 详情页面 |
| `src/App.tsx` | 修改：添加路由配置 |
| `src/components/Header.tsx` | 修改：添加博客导航链接 |

---

## Task 1: 安装依赖

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: 安装 react-router-dom 和 markdown 相关依赖**

Run: `npm install react-router-dom gray-matter react-markdown react-syntax-highlighter`
Run: `npm install -D @types/react-syntax-highlighter`

Expected: 依赖安装成功，package.json 更新

- [ ] **Step 2: 验证安装**

Run: `npm list react-router-dom gray-matter react-markdown`
Expected: 显示版本号，无错误

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add blog dependencies (router, markdown parser)"
```

---

## Task 2: 创建博客类型定义

**Files:**
- Create: `src/types/blog.ts`

- [ ] **Step 1: 创建 types 目录和类型定义文件**

```typescript
// src/types/blog.ts

export interface BlogMeta {
  slug: string;
  title: string;
  date: string;
  cover: string;
  tags: string[];
  excerpt: string;
}

export interface BlogPost extends BlogMeta {
  content: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/blog.ts
git commit -m "feat: add blog type definitions"
```

---

## Task 3: 创建 Markdown 解析工具

**Files:**
- Create: `src/utils/markdown.ts`

- [ ] **Step 1: 实现 Markdown 解析函数**

```typescript
// src/utils/markdown.ts
import matter from 'gray-matter';
import { BlogMeta, BlogPost } from '../types/blog';

// 模拟从文件系统读取 Markdown
// 在 Vite 中需要使用 import.meta.glob 或 raw import
export async function parseMarkdown(slug: string): Promise<BlogPost | null> {
  try {
    // 动态导入 Markdown 文件内容
    const modules = import.meta.glob('../data/posts/*.md', { as: 'raw', eager: true });
    const path = `../data/posts/${slug}.md`;
    const content = modules[path];
    
    if (!content) {
      return null;
    }
    
    const { data, content: markdownContent } = matter(content);
    
    return {
      slug,
      title: data.title,
      date: data.date,
      cover: data.cover,
      tags: data.tags || [],
      excerpt: data.excerpt || '',
      content: markdownContent,
    };
  } catch (error) {
    console.error('Failed to parse markdown:', error);
    return null;
  }
}

export function getAllBlogs(): BlogMeta[] {
  // 从 blogs.ts 导入
  return [];
}
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/markdown.ts
git commit -m "feat: add markdown parsing utilities"
```

---

## Task 4: 创建博客数据文件

**Files:**
- Create: `src/data/blogs.ts`
- Create: `src/data/posts/hello-world.md`
- Create: `public/images/blog-covers/` (目录)

- [ ] **Step 1: 创建博客元数据索引**

```typescript
// src/data/blogs.ts
import { BlogMeta } from '../types/blog';

export const blogs: BlogMeta[] = [
  {
    slug: 'hello-world',
    title: 'Hello World - 我的第一篇博客',
    date: '2025-04-07',
    cover: '/images/blog-covers/hello-world.jpg',
    tags: ['随笔', '开始'],
    excerpt: '欢迎来到我的博客！这里将记录我的学习历程和技术分享。',
  },
];

export function getBlogBySlug(slug: string): BlogMeta | undefined {
  return blogs.find(blog => blog.slug === slug);
}

export function getAllTags(): string[] {
  const tagSet = new Set<string>();
  blogs.forEach(blog => blog.tags.forEach(tag => tagSet.add(tag)));
  return Array.from(tagSet);
}
```

- [ ] **Step 2: 创建第一篇博客文章**

```markdown
---
title: 'Hello World - 我的第一篇博客'
date: '2025-04-07'
cover: '/images/blog-covers/hello-world.jpg'
tags: ['随笔', '开始']
---

# Hello World

欢迎来到我的博客！这里将记录我的学习历程和技术分享。

## 为什么开始写博客

写博客是一个很好的学习方式：

1. **加深理解** - 教别人是最好的学习方式
2. **记录成长** - 回头看自己的进步
3. **分享交流** - 与社区互动，获得反馈

## 接下来的计划

我会分享关于前端开发、React、TypeScript 等技术的学习心得。

```tsx
// 示例代码
const greeting = "Hello World";
console.log(greeting);
```

期待与你的交流！
```

- [ ] **Step 3: 创建占位封面图目录**

Run: `mkdir -p public/images/blog-covers`

- [ ] **Step 4: Commit**

```bash
git add src/data/blogs.ts src/data/posts/hello-world.md
git commit -m "feat: add blog data and first post"
```

---

## Task 5: 创建 BlogCard 组件

**Files:**
- Create: `src/components/BlogCard.tsx`

- [ ] **Step 1: 实现博客卡片组件**

```tsx
// src/components/BlogCard.tsx
import { Link } from 'react-router-dom';
import { BlogMeta } from '../types/blog';
import { Calendar, Tag } from 'lucide-react';

interface BlogCardProps {
  blog: BlogMeta;
}

const BlogCard = ({ blog }: BlogCardProps) => {
  return (
    <Link
      to={`/blog/${blog.slug}`}
      className="group block bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-[1.02]"
    >
      {/* Cover Image */}
      <div className="aspect-video overflow-hidden bg-gray-800">
        <img
          src={blog.cover}
          alt={blog.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      
      {/* Content */}
      <div className="p-6">
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {blog.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded-full"
            >
              <Tag size={12} />
              {tag}
            </span>
          ))}
        </div>
        
        {/* Title */}
        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors line-clamp-2">
          {blog.title}
        </h3>
        
        {/* Excerpt */}
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {blog.excerpt}
        </p>
        
        {/* Date */}
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Calendar size={14} />
          <time>{new Date(blog.date).toLocaleDateString('zh-CN')}</time>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/BlogCard.tsx
git commit -m "feat: add BlogCard component"
```

---

## Task 6: 创建 BlogList 组件

**Files:**
- Create: `src/components/BlogList.tsx`

- [ ] **Step 1: 实现博客列表组件**

```tsx
// src/components/BlogList.tsx
import { BlogMeta } from '../types/blog';
import BlogCard from './BlogCard';
import { motion } from 'framer-motion';

interface BlogListProps {
  blogs: BlogMeta[];
}

const BlogList = ({ blogs }: BlogListProps) => {
  // 按日期倒序排列
  const sortedBlogs = [...blogs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedBlogs.map((blog, index) => (
        <motion.div
          key={blog.slug}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <BlogCard blog={blog} />
        </motion.div>
      ))}
    </div>
  );
};

export default BlogList;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/BlogList.tsx
git commit -m "feat: add BlogList component with animations"
```

---

## Task 7: 创建 BlogDetail 组件

**Files:**
- Create: `src/components/BlogDetail.tsx`

- [ ] **Step 1: 实现文章详情组件**

```tsx
// src/components/BlogDetail.tsx
import { BlogPost } from '../types/blog';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Calendar, Tag, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BlogDetailProps {
  post: BlogPost;
}

const BlogDetail = ({ post }: BlogDetailProps) => {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Link */}
      <Link
        to="/blog"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors mb-8"
      >
        <ArrowLeft size={20} />
        返回博客列表
      </Link>

      {/* Header */}
      <header className="mb-8">
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-purple-500/20 text-purple-300 rounded-full"
            >
              <Tag size={14} />
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
          {post.title}
        </h1>

        {/* Date */}
        <div className="flex items-center gap-2 text-gray-400">
          <Calendar size={18} />
          <time>{new Date(post.date).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</time>
        </div>
      </header>

      {/* Cover Image */}
      <div className="aspect-video rounded-xl overflow-hidden mb-8 bg-gray-800">
        <img
          src={post.cover}
          alt={post.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="prose prose-invert prose-lg max-w-none">
        <ReactMarkdown
          components={{
            code({ className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              const language = match ? match[1] : '';
              
              if (language) {
                return (
                  <SyntaxHighlighter
                    style={oneDark}
                    language={language}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                );
              }
              
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {post.content}
        </ReactMarkdown>
      </div>
    </article>
  );
};

export default BlogDetail;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/BlogDetail.tsx
git commit -m "feat: add BlogDetail component with markdown rendering"
```

---

## Task 8: 创建 BlogPage 列表页面

**Files:**
- Create: `src/pages/BlogPage.tsx`

- [ ] **Step 1: 实现博客列表页面**

```tsx
// src/pages/BlogPage.tsx
import { motion } from 'framer-motion';
import BlogList from '../components/BlogList';
import { blogs } from '../data/blogs';
import { BookOpen } from 'lucide-react';

const BlogPage = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full text-purple-400 text-sm mb-6">
            <BookOpen size={16} />
            博客
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            学习笔记 <span className="text-purple-400">&</span> 技术分享
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            记录学习历程，分享技术心得，与你一起成长
          </p>
        </motion.div>

        {/* Blog List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <BlogList blogs={blogs} />
        </motion.div>
      </div>
    </div>
  );
};

export default BlogPage;
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/BlogPage.tsx
git commit -m "feat: add BlogPage list view"
```

---

## Task 9: 创建 BlogPostPage 详情页面

**Files:**
- Create: `src/pages/BlogPostPage.tsx`

- [ ] **Step 1: 实现博客详情页面**

```tsx
// src/pages/BlogPostPage.tsx
import { useParams, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import BlogDetail from '../components/BlogDetail';
import { BlogPost } from '../types/blog';
import { parseMarkdown } from '../utils/markdown';
import { Loader2 } from 'lucide-react';

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadPost(slug);
    }
  }, [slug]);

  const loadPost = async (postSlug: string) => {
    setLoading(true);
    const data = await parseMarkdown(postSlug);
    setPost(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-20">
      <BlogDetail post={post} />
    </div>
  );
};

export default BlogPostPage;
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/BlogPostPage.tsx
git commit -m "feat: add BlogPostPage detail view"
```

---

## Task 10: 更新 App.tsx 添加路由

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: 重构 App.tsx 添加 React Router**

```tsx
// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';

// 首页组件
const HomePage = () => (
  <>
    <Hero />
    <About />
    <Projects />
    <Contact />
  </>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
```

- [ ] **Step 2: Commit**

```bash
git add src/App.tsx
git commit -m "feat: add React Router and blog routes"
```

---

## Task 11: 更新 Header 添加博客导航

**Files:**
- Modify: `src/components/Header.tsx`

- [ ] **Step 1: 替换导航链接为 React Router Link**

```tsx
// src/components/Header.tsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 判断是否在首页
  const isHomePage = location.pathname === '/';

  const navLinks = [
    { name: '关于', href: '/#about', isAnchor: true },
    { name: '项目', href: '/#projects', isAnchor: true },
    { name: '博客', href: '/blog', isAnchor: false },
    { name: '联系', href: '/#contact', isAnchor: true },
  ];

  const handleNavClick = (href: string, isAnchor: boolean) => {
    setIsMobileMenuOpen(false);
    
    if (isAnchor && isHomePage) {
      // 在首页锚点跳转
      const element = document.querySelector(href.replace('/', ''));
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/10' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
          >
            Portfolio
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => handleNavClick(link.href, link.isAnchor)}
                className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <nav className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium"
                  onClick={() => handleNavClick(link.href, link.isAnchor)}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Header.tsx
git commit -m "feat: update Header with blog navigation and React Router"
```

---

## Task 12: 配置 Tailwind 排版插件

**Files:**
- Modify: `tailwind.config.js`
- Modify: `package.json`

- [ ] **Step 1: 安装 @tailwindcss/typography 插件**

Run: `npm install -D @tailwindcss/typography`

- [ ] **Step 2: 更新 tailwind.config.js**

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
```

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.js package.json package-lock.json
git commit -m "chore: add Tailwind typography plugin for markdown styling"
```

---

## Task 13: 准备封面图资源

**Files:**
- Create: `public/images/blog-covers/hello-world.jpg` (占位)

- [ ] **Step 1: 创建占位封面图说明**

由于无法直接创建图片文件，需要用户准备：
- 在 `public/images/blog-covers/` 目录下放一张 `hello-world.jpg` 作为第一篇博客的封面
- 建议尺寸：1200x675 (16:9)

或者使用在线图片 URL 临时代替：

修改 `src/data/blogs.ts`：
```typescript
cover: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800',
```

- [ ] **Step 2: Commit（如果有图片则添加）**

```bash
# 如果有图片文件
git add public/images/blog-covers/
git commit -m "assets: add blog cover images"
```

---

## Task 14: 修复 Markdown 导入方式

**Files:**
- Modify: `src/utils/markdown.ts`

由于 Vite 的 `import.meta.glob` 在动态路径下有限制，需要调整实现方式。

- [ ] **Step 1: 使用静态导入方式**

```typescript
// src/utils/markdown.ts
import matter from 'gray-matter';
import { BlogMeta, BlogPost } from '../types/blog';

// 静态导入所有 Markdown 文件
const postFiles = import.meta.glob('../data/posts/*.md', { as: 'raw', eager: true });

export async function parseMarkdown(slug: string): Promise<BlogPost | null> {
  try {
    const path = `../data/posts/${slug}.md`;
    const content = postFiles[path];
    
    if (!content) {
      console.warn(`Post not found: ${slug}`);
      return null;
    }
    
    const { data, content: markdownContent } = matter(content);
    
    return {
      slug,
      title: data.title,
      date: data.date,
      cover: data.cover,
      tags: data.tags || [],
      excerpt: data.excerpt || '',
      content: markdownContent,
    };
  } catch (error) {
    console.error('Failed to parse markdown:', error);
    return null;
  }
}

// 预加载所有文章（可选）
export async function loadAllPosts(): Promise<BlogPost[]> {
  const posts: BlogPost[] = [];
  
  for (const path of Object.keys(postFiles)) {
    const slug = path.replace('../data/posts/', '').replace('.md', '');
    const post = await parseMarkdown(slug);
    if (post) {
      posts.push(post);
    }
  }
  
  return posts.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/markdown.ts
git commit -m "fix: update markdown loader for Vite compatibility"
```

---

## Task 15: 验证构建

**Files:**
- All files

- [ ] **Step 1: 运行 TypeScript 检查**

Run: `npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 2: 运行构建**

Run: `npm run build`
Expected: 构建成功，dist 目录生成

- [ ] **Step 3: 预览构建结果**

Run: `npm run preview`
Test: 访问 http://localhost:4173
  - 首页正常显示
  - 点击"博客"导航到 /blog
  - 博客列表显示文章卡片
  - 点击卡片进入文章详情
  - 代码高亮正常

- [ ] **Step 4: 最终提交**

```bash
git add .
git commit -m "feat: complete blog feature implementation"
```

---

## Spec Self-Review Checklist

**1. Spec coverage:**
- ✅ 博客列表页 `/blog` - Task 8
- ✅ 文章详情页 `/blog/:slug` - Task 9
- ✅ Markdown 解析 - Task 3, 14
- ✅ 卡片网格布局 - Task 5, 6
- ✅ 代码高亮 - Task 7
- ✅ 导航更新 - Task 11
- ✅ 路由配置 - Task 10

**2. Placeholder scan:**
- ✅ 无 "TBD", "TODO"
- ✅ 所有代码完整，无 "implement later"
- ✅ 无 "similar to Task N"

**3. Type consistency:**
- ✅ `BlogMeta`, `BlogPost` 类型在 Task 2 定义，后续一致使用
- ✅ `parseMarkdown` 返回类型一致

**4. Dependencies:**
- ✅ 所有 npm 包已列出
- ✅ 类型定义包已包含

---

## 发布后使用指南

添加新博客文章：

1. 在 `src/data/posts/` 创建 `article-slug.md`
2. 在 `public/images/blog-covers/` 添加封面图
3. 更新 `src/data/blogs.ts` 添加元数据
4. `git add . && git commit -m "blog: add new post" && git push`
5. Vercel 自动部署

Markdown 文件格式：

```markdown
---
title: '文章标题'
date: '2025-04-07'
cover: '/images/blog-covers/image.jpg'
tags: ['标签1', '标签2']
excerpt: '文章摘要简介'
---

正文内容...
```
