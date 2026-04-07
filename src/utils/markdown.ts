// src/utils/markdown.ts
import matter from 'gray-matter';
import { BlogMeta, BlogPost } from '../types/blog';

// 动态导入所有 Markdown 文件
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
