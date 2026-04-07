import type { BlogMeta } from '../types/blog';

export const blogs: BlogMeta[] = [
  {
    slug: 'hello-world',
    title: 'Hello World - 我的第一篇博客',
    date: '2025-04-07',
    cover: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800',
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
