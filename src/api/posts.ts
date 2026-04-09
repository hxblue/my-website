import type { BlogMeta, BlogPost } from '../types/blog';

const NOTION_TOKEN = import.meta.env.VITE_NOTION_TOKEN;
const DATABASE_ID = import.meta.env.VITE_NOTION_DATABASE_ID;
// 开发环境使用 Vite 代理，生产环境使用 Vercel API 路由
const NOTION_API_URL = import.meta.env.DEV ? '/notion-api' : '/api/notion';

/**
 * 检查 Notion 是否已配置
 */
function isNotionConfigured(): boolean {
  return !!NOTION_TOKEN && !!DATABASE_ID;
}

/**
 * 提取标签（支持 Multi-select 和 Text 两种类型）
 */
function extractTags(tagsProperty: any): string[] {
  if (!tagsProperty) return [];

  // Multi-select 类型
  if (tagsProperty.multi_select) {
    return tagsProperty.multi_select.map((tag: any) => tag.name);
  }

  // Text 类型（逗号分隔）
  if (tagsProperty.rich_text) {
    const text = tagsProperty.rich_text[0]?.plain_text || '';
    return text.split(',').map((t: string) => t.trim()).filter(Boolean);
  }

  return [];
}

/**
 * 调用 Notion API
 */
async function notionFetch(endpoint: string, options: RequestInit = {}) {
  const isDev = import.meta.env.DEV;

  // 构建 URL
  // 开发环境: /notion-api/databases/xxx/query
  // 生产环境: /api/notion?notionPath=databases/xxx/query
  let url: string;
  if (isDev) {
    url = `${NOTION_API_URL}${endpoint}`;
  } else {
    const notionPath = endpoint.replace(/^\//, '');
    url = `${NOTION_API_URL}?notionPath=${encodeURIComponent(notionPath)}`;
  }

  // 开发环境直接请求，需要 Token；生产环境走 Vercel Function
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (isDev) {
    headers['Authorization'] = `Bearer ${NOTION_TOKEN}`;
    headers['Notion-Version'] = '2022-06-28';
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Notion API error:', response.status, errorText);
    console.error('Request URL:', url);
    throw new Error(`Notion API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * 获取已发布的文章列表
 */
export async function getPublishedPosts(): Promise<BlogMeta[]> {
  if (!isNotionConfigured()) {
    console.warn('Notion is not configured');
    return [];
  }

  try {
    const response = await notionFetch(`/databases/${DATABASE_ID}/query`, {
      method: 'POST',
      body: JSON.stringify({
        filter: {
          property: 'Published',
          checkbox: {
            equals: true,
          },
        },
        sorts: [
          {
            property: 'Date',
            direction: 'descending',
          },
        ],
      }),
    });

    if (!response.results || response.results.length === 0) {
      return [];
    }

    return response.results.map((page: any) => {
      const properties = page.properties;

      return {
        slug: properties.Slug?.rich_text?.[0]?.plain_text || '',
        title: properties.Name?.title?.[0]?.plain_text || 'Untitled',
        date: properties.Date?.date?.start || new Date().toISOString().split('T')[0],
        cover: properties.Cover?.url || '',
        tags: extractTags(properties.Tags),
        excerpt: properties.Excerpt?.rich_text?.[0]?.plain_text || '',
      };
    });
  } catch (error) {
    console.error('Error fetching posts from Notion:', error);
    return [];
  }
}

/**
 * 获取页面的 blocks 内容
 */
async function getPageBlocks(pageId: string): Promise<string> {
  try {
    const response = await notionFetch(`/blocks/${pageId}/children`);
    return blocksToMarkdown(response.results || []);
  } catch (error) {
    console.error('Error fetching page blocks:', error);
    return '';
  }
}

/**
 * 将 Notion blocks 转换为 Markdown
 */
function blocksToMarkdown(blocks: any[]): string {
  return blocks.map((block) => {
    const type = block.type;
    const blockContent = block[type];

    switch (type) {
      case 'paragraph':
        return extractText(blockContent.rich_text);

      case 'heading_1':
        return `# ${extractText(blockContent.rich_text)}`;

      case 'heading_2':
        return `## ${extractText(blockContent.rich_text)}`;

      case 'heading_3':
        return `### ${extractText(blockContent.rich_text)}`;

      case 'bulleted_list_item':
        return `- ${extractText(blockContent.rich_text)}`;

      case 'numbered_list_item':
        return `1. ${extractText(blockContent.rich_text)}`;

      case 'quote':
        return `> ${extractText(blockContent.rich_text)}`;

      case 'code': {
        const lang = blockContent.language || '';
        const code = extractText(blockContent.rich_text);
        return '```' + lang + '\n' + code + '\n```';
      }

      case 'divider':
        return '---';

      case 'image':
        const imageUrl = blockContent.external?.url || blockContent.file?.url || '';
        return imageUrl ? `![image](${imageUrl})` : '';

      default:
        return '';
    }
  }).join('\n\n');
}

/**
 * 从 rich_text 中提取纯文本
 */
function extractText(richText: any[]): string {
  if (!richText || !Array.isArray(richText)) return '';
  return richText.map((text) => text.plain_text || '').join('');
}

/**
 * 根据 slug 获取单篇文章
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!isNotionConfigured()) {
    console.warn('Notion is not configured');
    return null;
  }

  try {

    const response = await notionFetch(`/databases/${DATABASE_ID}/query`, {
      method: 'POST',
      body: JSON.stringify({
        filter: {
          and: [
            {
              property: 'Slug',
              rich_text: {
                equals: slug,
              },
            },
            {
              property: 'Published',
              checkbox: {
                equals: true,
              },
            },
          ],
        },
      }),
    });

    if (!response.results || response.results.length === 0) {
      return null;
    }

    const page = response.results[0];
    const properties = page.properties;
    const pageId = page.id;

    // 从页面 blocks 获取内容
    const content = await getPageBlocks(pageId);

    return {
      slug,
      title: properties.Name?.title?.[0]?.plain_text || 'Untitled',
      date: properties.Date?.date?.start || new Date().toISOString().split('T')[0],
      cover: properties.Cover?.url || '',
      tags: extractTags(properties.Tags),
      excerpt: properties.Excerpt?.rich_text?.[0]?.plain_text || '',
      content,
    };
  } catch (error) {
    console.error('Error fetching post from Notion:', error);
    return null;
  }
}

/**
 * 获取所有标签
 */
export async function getAllTags(): Promise<string[]> {
  if (!isNotionConfigured()) {
    return [];
  }

  try {
    const response = await notionFetch(`/databases/${DATABASE_ID}`);

    const tagsProperty = response.properties?.Tags;
    if (tagsProperty?.multi_select?.options) {
      return tagsProperty.multi_select.options.map((tag: any) => tag.name);
    }

    return [];
  } catch (error) {
    console.error('Error fetching tags from Notion:', error);
    return [];
  }
}
