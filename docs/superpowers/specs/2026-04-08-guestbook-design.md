# 留言板功能设计文档

## 概述
在博客文章底部添加评论区功能，访客可以留下昵称和留言内容，使用 Supabase 存储数据，包含智能敏感词过滤。

## 需求确认

### 功能定位
- 位置：博客文章底部（BlogPostPage）
- 服务：Supabase 数据库存储
- 审核：智能过滤（敏感词进入待审核队列）
- 访客信息：仅昵称 + 留言内容（最简洁）

## 数据库设计

### 表结构

```sql
-- 创建留言表
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_slug TEXT NOT NULL,
  nickname TEXT NOT NULL CHECK (length(nickname) <= 50),
  content TEXT NOT NULL CHECK (length(content) <= 500),
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_hash TEXT -- 用于简单防刷，存储 IP 的 MD5 哈希
);

-- 索引
CREATE INDEX idx_comments_blog_slug ON comments(blog_slug);
CREATE INDEX idx_comments_status ON comments(status);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);
```

### Row Level Security (RLS)

```sql
-- 启用 RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 允许任何人读取 approved 状态的留言
CREATE POLICY "Allow reading approved comments" ON comments
  FOR SELECT USING (status = 'approved');

-- 允许任何人插入留言（通过匿名 key）
CREATE POLICY "Allow inserting comments" ON comments
  FOR INSERT WITH CHECK (true);
```

## 组件架构

```
BlogPostPage/
├── BlogDetail (现有)
└── CommentSection (新增)
    ├── CommentList
    │   └── CommentItem (循环渲染)
    └── CommentForm
        ├── nickname Input
        ├── content Textarea
        ├── Submit Button
        └── Success/Error Message
```

## 数据结构

### 类型定义

```typescript
// src/types/comment.ts
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

## API 设计

### Supabase 客户端封装

```typescript
// src/lib/supabase.ts
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// src/api/comments.ts
export async function getComments(blogSlug: string): Promise<Comment[]>
export async function createComment(data: CommentFormData & { blogSlug: string }): Promise<Comment>
```

## 智能过滤规则

### 敏感词检测
- 预定义敏感词库（政治、暴力、广告相关词汇）
- 检测到敏感词 → status = 'pending'，提示用户"留言已提交，等待审核"
- 无敏感词 → status = 'approved'，立即显示

### 速率限制（前端实现）
- 同一浏览器本地存储最后提交时间
- 间隔至少 30 秒才能再次提交

## UI/UX 设计

### 样式规范
- 适配现有主题系统（dark/light 模式）
- 时间显示：相对时间（"2小时前"）
- 空状态："还没有留言，来抢沙发吧~"
- 加载状态：骨架屏

### 响应式
- 移动端：表单单行布局
- 桌面端：表单可适当展开

## 依赖项

```bash
npm install @supabase/supabase-client
```

## 环境变量

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 部署步骤

1. 创建 Supabase 项目
2. 执行 SQL 创建表和 RLS 策略
3. 复制 API 密钥到项目环境变量
4. 部署前端代码

## 未来扩展（可选）

- 管理员后台审核界面
- 评论回复功能（嵌套评论）
- 邮件通知新留言
- 用户头像（Gravatar）
