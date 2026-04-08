# 留言板功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在博客文章底部添加评论区，访客可提交昵称和留言，数据存储在 Supabase，包含智能敏感词过滤。

**架构：** 前端使用 React + TypeScript，通过 Supabase Client 直接与数据库交互，采用 Row Level Security 控制访问权限。敏感词过滤在前端实现，检测到敏感词的留言标记为 pending 状态。

**技术栈：** React, TypeScript, Tailwind CSS, Supabase JavaScript Client

---

## 前置准备

### Task 0: 创建 Supabase 项目并配置数据库

**说明：** 需要在 Supabase 官网创建项目，获取 API 密钥，并执行 SQL 创建表。

**步骤：**
1. 访问 https://supabase.com 并注册/登录
2. 创建新项目，记住项目 URL 和 anon key
3. 在 SQL Editor 中执行以下 SQL：

```sql
-- 创建留言表
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_slug TEXT NOT NULL,
  nickname TEXT NOT NULL CHECK (length(nickname) <= 50),
  content TEXT NOT NULL CHECK (length(content) <= 500),
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_comments_blog_slug ON comments(blog_slug);
CREATE INDEX idx_comments_status ON comments(status);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- 启用 RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 允许任何人读取 approved 状态的留言
CREATE POLICY "Allow reading approved comments" ON comments
  FOR SELECT USING (status = 'approved');

-- 允许任何人插入留言
CREATE POLICY "Allow inserting comments" ON comments
  FOR INSERT WITH CHECK (true);
```

4. 复制项目 URL 和 anon key，在下一步使用

---

## 第一阶段：基础配置

### Task 1: 安装 Supabase 客户端并配置环境变量

**Files:**
- Create: `.env`
- Create: `.env.example`
- Create: `src/lib/supabase.ts`
- Create: `src/types/comment.ts`

- [ ] **Step 1: 安装依赖**

```bash
npm install @supabase/supabase-js
```

- [ ] **Step 2: 创建 .env 文件**

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

- [ ] **Step 3: 创建 .env.example 模板文件**

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

- [ ] **Step 4: 创建 Supabase 客户端**

**File:** `src/lib/supabase.ts`
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not set. Guestbook feature will not work.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
```

- [ ] **Step 5: 创建 Comment 类型定义**

**File:** `src/types/comment.ts`
```typescript
export interface Comment {
  id: string;
  blog_slug: string;
  nickname: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface CommentFormData {
  nickname: string;
  content: string;
}
```

- [ ] **Step 6: 提交**

```bash
git add .env.example src/lib/supabase.ts src/types/comment.ts package.json package-lock.json
git commit -m "chore: setup Supabase client and comment types"
```

---

## 第二阶段：API 层

### Task 2: 创建评论 API 模块

**Files:**
- Create: `src/api/comments.ts`

- [ ] **Step 1: 创建评论 API 模块**

**File:** `src/api/comments.ts`
```typescript
import { supabase } from '../lib/supabase';
import type { Comment, CommentFormData } from '../types/comment';

// 敏感词列表（简化版）
const SENSITIVE_WORDS = [
  '反动', '色情', '赌博', '毒品', '暴力',
  'fuck', 'shit', 'bitch', 'damn'
];

function containsSensitiveWords(text: string): boolean {
  const lowerText = text.toLowerCase();
  return SENSITIVE_WORDS.some(word => lowerText.includes(word.toLowerCase()));
}

export async function getComments(blogSlug: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('blog_slug', blogSlug)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching comments:', error);
    throw new Error('Failed to fetch comments');
  }

  return data || [];
}

export async function createComment(
  blogSlug: string,
  formData: CommentFormData
): Promise<{ comment: Comment; isPending: boolean }> {
  const hasSensitiveWords = 
    containsSensitiveWords(formData.nickname) || 
    containsSensitiveWords(formData.content);

  const { data, error } = await supabase
    .from('comments')
    .insert([
      {
        blog_slug: blogSlug,
        nickname: formData.nickname.trim(),
        content: formData.content.trim(),
        status: hasSensitiveWords ? 'pending' : 'approved',
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating comment:', error);
    throw new Error('Failed to create comment');
  }

  return {
    comment: data,
    isPending: hasSensitiveWords,
  };
}
```

- [ ] **Step 2: 提交**

```bash
git add src/api/comments.ts
git commit -m "feat: add comments API module with sensitive word filtering"
```

---

## 第三阶段：自定义 Hook

### Task 3: 创建 useComments Hook

**Files:**
- Create: `src/hooks/useComments.ts`

- [ ] **Step 1: 创建 useComments hook**

**File:** `src/hooks/useComments.ts`
```typescript
import { useState, useEffect, useCallback } from 'react';
import { getComments, createComment as apiCreateComment } from '../api/comments';
import type { Comment, CommentFormData } from '../types/comment';

interface UseCommentsReturn {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
  submitComment: (formData: CommentFormData) => Promise<{ success: boolean; isPending: boolean; message: string }>;
}

export function useComments(blogSlug: string): UseCommentsReturn {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchComments() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getComments(blogSlug);
        setComments(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load comments');
      } finally {
        setIsLoading(false);
      }
    }

    fetchComments();
  }, [blogSlug]);

  const submitComment = useCallback(
    async (formData: CommentFormData): Promise<{ success: boolean; isPending: boolean; message: string }> => {
      try {
        const { comment, isPending } = await apiCreateComment(blogSlug, formData);
        
        if (!isPending) {
          setComments(prev => [comment, ...prev]);
        }

        return {
          success: true,
          isPending,
          message: isPending 
            ? '留言已提交，等待审核后显示' 
            : '留言发布成功！',
        };
      } catch (err) {
        return {
          success: false,
          isPending: false,
          message: err instanceof Error ? err.message : '发布失败，请重试',
        };
      }
    },
    [blogSlug]
  );

  return { comments, isLoading, error, submitComment };
}
```

- [ ] **Step 2: 提交**

```bash
git add src/hooks/useComments.ts
git commit -m "feat: add useComments hook for data fetching and submission"
```

---

## 第四阶段：UI 组件

### Task 4: 创建时间格式化工具函数

**Files:**
- Create: `src/utils/time.ts`

- [ ] **Step 1: 创建时间格式化工具**

**File:** `src/utils/time.ts`
```typescript
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return '刚刚';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}分钟前`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}小时前`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays}天前`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}个月前`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears}年前`;
}
```

- [ ] **Step 2: 提交**

```bash
git add src/utils/time.ts
git commit -m "feat: add relative time formatter"
```

---

### Task 5: 创建 CommentItem 组件

**Files:**
- Create: `src/components/CommentItem.tsx`

- [ ] **Step 1: 创建 CommentItem 组件**

**File:** `src/components/CommentItem.tsx`
```typescript
import type { Comment } from '../types/comment';
import { formatRelativeTime } from '../utils/time';

interface CommentItemProps {
  comment: Comment;
}

export default function CommentItem({ comment }: CommentItemProps) {
  return (
    <div className="py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-gray-900 dark:text-white">
          {comment.nickname}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {formatRelativeTime(comment.created_at)}
        </span>
      </div>
      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
        {comment.content}
      </p>
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/CommentItem.tsx
git commit -m "feat: add CommentItem component"
```

---

### Task 6: 创建 CommentList 组件

**Files:**
- Create: `src/components/CommentList.tsx`

- [ ] **Step 1: 创建 CommentList 组件**

**File:** `src/components/CommentList.tsx`
```typescript
import type { Comment } from '../types/comment';
import CommentItem from './CommentItem';

interface CommentListProps {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
}

export default function CommentList({ comments, isLoading, error }: CommentListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="py-4 border-b border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="flex items-center justify-between mb-2">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-3 w-2/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>加载留言失败: {error}</p>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p className="text-lg mb-2">还没有留言</p>
        <p className="text-sm">来抢沙发吧~</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {comments.length} 条留言
      </h3>
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/CommentList.tsx
git commit -m "feat: add CommentList component with loading and empty states"
```

---

### Task 7: 创建 CommentForm 组件

**Files:**
- Create: `src/components/CommentForm.tsx`

- [ ] **Step 1: 创建 CommentForm 组件**

**File:** `src/components/CommentForm.tsx`
```typescript
import { useState, useRef } from 'react';
import type { CommentFormData } from '../types/comment';

interface CommentFormProps {
  onSubmit: (data: CommentFormData) => Promise<{ success: boolean; isPending: boolean; message: string }>;
}

export default function CommentForm({ onSubmit }: CommentFormProps) {
  const [nickname, setNickname] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const lastSubmitTime = useRef<number>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 基本验证
    if (!nickname.trim() || !content.trim()) {
      setMessage({ type: 'error', text: '请填写昵称和留言内容' });
      return;
    }

    if (nickname.trim().length > 50) {
      setMessage({ type: 'error', text: '昵称不能超过50个字符' });
      return;
    }

    if (content.trim().length > 500) {
      setMessage({ type: 'error', text: '留言内容不能超过500个字符' });
      return;
    }

    // 速率限制：30秒内只能提交一次
    const now = Date.now();
    if (now - lastSubmitTime.current < 30000) {
      setMessage({ type: 'error', text: '提交太频繁，请稍后再试' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const result = await onSubmit({
        nickname: nickname.trim(),
        content: content.trim(),
      });

      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setNickname('');
        setContent('');
        lastSubmitTime.current = now;
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch {
      setMessage({ type: 'error', text: '提交失败，请重试' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        发表评论
      </h3>

      <div>
        <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          昵称 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={50}
          placeholder="你的昵称"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          留言内容 <span className="text-red-500">*</span>
          <span className="text-xs text-gray-500 ml-2">({content.length}/500)</span>
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={500}
          rows={4}
          placeholder="写下你的想法..."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     placeholder-gray-400 dark:placeholder-gray-500 resize-none"
        />
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
          }`}
        >
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 
                   disabled:bg-gray-400 disabled:cursor-not-allowed
                   text-white font-medium rounded-lg transition-colors
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                   dark:focus:ring-offset-gray-900"
      >
        {isSubmitting ? '提交中...' : '发表评论'}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/CommentForm.tsx
git commit -m "feat: add CommentForm component with validation and rate limiting"
```

---

### Task 8: 创建 CommentSection 组件

**Files:**
- Create: `src/components/CommentSection.tsx`

- [ ] **Step 1: 创建 CommentSection 组件**

**File:** `src/components/CommentSection.tsx`
```typescript
import { useComments } from '../hooks/useComments';
import CommentList from './CommentList';
import CommentForm from './CommentForm';

interface CommentSectionProps {
  blogSlug: string;
}

export default function CommentSection({ blogSlug }: CommentSectionProps) {
  const { comments, isLoading, error, submitComment } = useComments(blogSlug);

  return (
    <section className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        留言板
      </h2>

      <div className="space-y-8">
        <CommentForm onSubmit={submitComment} />
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <CommentList comments={comments} isLoading={isLoading} error={error} />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/CommentSection.tsx
git commit -m "feat: add CommentSection component"
```

---

## 第五阶段：集成到页面

### Task 9: 在 BlogPostPage 中集成 CommentSection

**Files:**
- Modify: `src/pages/BlogPostPage.tsx`

- [ ] **Step 1: 添加 CommentSection 导入和渲染**

**File:** `src/pages/BlogPostPage.tsx`

在现有 import 语句后添加：
```typescript
import CommentSection from '../components/CommentSection';
```

在 return 语句的 BlogDetail 组件后添加 CommentSection：
```typescript
return (
  <main className="flex-1 py-20">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <BlogDetail post={post} />
      <CommentSection blogSlug={slug} />
    </div>
  </main>
);
```

- [ ] **Step 2: 提交**

```bash
git add src/pages/BlogPostPage.tsx
git commit -m "feat: integrate CommentSection into BlogPostPage"
```

---

## 第六阶段：测试和优化

### Task 10: 验证实现

- [ ] **Step 1: 确保环境变量已配置**

检查 `.env` 文件包含有效的 Supabase URL 和 anon key。

- [ ] **Step 2: 构建项目**

```bash
npm run build
```

预期输出：构建成功，无错误。

- [ ] **Step 3: 本地测试**

```bash
npm run dev
```

1. 打开浏览器访问 http://localhost:5173
2. 导航到博客页面
3. 点击一篇文章
4. 测试留言功能：
   - 提交正常留言 → 立即显示
   - 提交含敏感词留言 → 提示等待审核
   - 不填昵称/内容 → 显示验证错误
   - 快速多次提交 → 显示速率限制提示

- [ ] **Step 4: 提交（如有更改）**

```bash
git status
# 如有更改则提交
git add .
git commit -m "fix: address any issues found during testing"
```

---

## 第七阶段：部署

### Task 11: 推送到 GitHub

- [ ] **Step 1: 推送代码**

```bash
git push origin main
```

- [ ] **Step 2: 配置 Vercel 环境变量**

在 Vercel Dashboard 中添加环境变量：
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

- [ ] **Step 3: 重新部署**

在 Vercel 中触发重新部署，或等待自动部署。

---

## 总结

实现完成后，你将拥有：
1. ✅ 基于 Supabase 的留言存储
2. ✅ 智能敏感词过滤（pending 状态）
3. ✅ 深色/浅色主题适配
4. ✅ 表单验证和速率限制
5. ✅ 相对时间显示
6. ✅ 加载和空状态

**注意事项：**
- 记得将 `.env` 文件添加到 `.gitignore`（如果还没有的话）
- 定期检查 Supabase 的 pending 留言并在后台审核
