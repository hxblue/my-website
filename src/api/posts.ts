import type { BlogMeta, BlogPost } from '../types/blog';

const NOTION_TOKEN = import.meta.env.VITE_NOTION_TOKEN;
const DATABASE_ID = import.meta.env.VITE_NOTION_DATABASE_ID;
// 开发环境使用 Vite 代理，生产环境使用 Vercel API 路由
const NOTION_API_URL = import.meta.env.DEV ? '/notion-api' : '/api/notion';

interface NotionText {
  plain_text?: string;
}

interface NotionProperty {
  title?: NotionText[];
  rich_text?: NotionText[];
  multi_select?: Array<{ name: string }>;
  select?: { name?: string };
  date?: { start?: string };
  number?: number | null;
  checkbox?: boolean;
  url?: string;
}

type NotionProperties = Record<string, NotionProperty | undefined>;

interface NotionPage {
  id: string;
  properties: NotionProperties;
}

interface NotionListResponse {
  results?: NotionPage[];
}

interface NotionBlockContent {
  rich_text?: NotionText[];
  language?: string;
  external?: { url?: string };
  file?: { url?: string };
}

type NotionBlock = { type: string } & Record<string, unknown>;

interface NotionBlocksResponse {
  results?: NotionBlock[];
}

interface NotionDatabaseResponse {
  properties?: Record<
    string,
    { multi_select?: { options?: Array<{ name: string }> } } | undefined
  >;
}

/**
 * 检查 Notion 是否已配置
 */
function isNotionConfigured(): boolean {
  return !!NOTION_TOKEN && !!DATABASE_ID;
}

/**
 * 提取标签（支持 Multi-select 和 Text 两种类型）
 */
function extractTags(tagsProperty?: NotionProperty): string[] {
  if (!tagsProperty) return [];

  // Multi-select 类型
  if (tagsProperty.multi_select) {
    return tagsProperty.multi_select.map((tag) => tag.name);
  }

  // Text 类型（逗号分隔）
  if (tagsProperty.rich_text) {
    const text = tagsProperty.rich_text[0]?.plain_text || '';
    return text.split(',').map((t: string) => t.trim()).filter(Boolean);
  }

  return [];
}

function extractPlainText(property?: NotionProperty): string | undefined {
  const value = property?.rich_text?.[0]?.plain_text;
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function extractCategory(property?: NotionProperty): string | undefined {
  const selectValue = property?.select?.name;
  if (typeof selectValue === 'string' && selectValue.trim()) return selectValue.trim();
  return extractPlainText(property);
}

function extractOptionalDate(property?: NotionProperty): string | undefined {
  const value = property?.date?.start;
  return typeof value === 'string' && value ? value : undefined;
}

function extractOptionalNumber(property?: NotionProperty): number | undefined {
  const value = property?.number;
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : undefined;
}

function mapOptionalMetadata(properties: NotionProperties, title: string) {
  return {
    category: extractCategory(properties.Category),
    updatedAt: extractOptionalDate(properties.Updated),
    pinned: properties.Pinned?.checkbox === true,
    readingMinutes: extractOptionalNumber(properties.ReadingTime),
    coverAlt: extractPlainText(properties.CoverAlt) ?? title,
  };
}

/**
 * 调用 Notion API
 */
async function notionFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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
    signal: options.signal ?? AbortSignal.timeout(15000),
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Notion API error: ${response.status} - ${errorText}`);
  }

  return response.json() as Promise<T>;
}

/**
 * 获取已发布的文章列表
 */
export async function getPublishedPosts(): Promise<BlogMeta[]> {
  if (!isNotionConfigured()) {
    throw new Error('Notion is not configured');
  }

  const response = await notionFetch<NotionListResponse>(`/databases/${DATABASE_ID}/query`, {
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

  if (!response.results || response.results.length === 0) return [];

  return response.results.map((page) => {
    const properties = page.properties;
    const title = properties.Name?.title?.[0]?.plain_text || 'Untitled';

    return {
      slug: properties.Slug?.rich_text?.[0]?.plain_text || '',
      title,
      date: properties.Date?.date?.start || new Date().toISOString().split('T')[0],
      cover: properties.Cover?.url || '',
      tags: extractTags(properties.Tags),
      excerpt: properties.Excerpt?.rich_text?.[0]?.plain_text || '',
      ...mapOptionalMetadata(properties, title),
    };
  });
}

/**
 * 获取页面的 blocks 内容
 */
async function getPageBlocks(pageId: string): Promise<string> {
  const response = await notionFetch<NotionBlocksResponse>(`/blocks/${pageId}/children`);
  return blocksToMarkdown(response.results || []);
}

/**
 * 将 Notion blocks 转换为 Markdown
 */
function blocksToMarkdown(blocks: NotionBlock[]): string {
  return blocks.map((block) => {
    const type = block.type;
    const blockContent = block[type] as NotionBlockContent | undefined;
    if (!blockContent) return '';

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

      case 'image': {
        const imageUrl = blockContent.external?.url || blockContent.file?.url || '';
        return imageUrl ? `![image](${imageUrl})` : '';
      }

      default:
        return '';
    }
  }).join('\n\n');
}

/**
 * 从 rich_text 中提取纯文本
 */
function extractText(richText?: NotionText[]): string {
  if (!richText || !Array.isArray(richText)) return '';
  return richText.map((text) => text.plain_text || '').join('');
}

/**
 * 根据 slug 获取单篇文章
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!isNotionConfigured()) {
    throw new Error('Notion is not configured');
  }

  const response = await notionFetch<NotionListResponse>(`/databases/${DATABASE_ID}/query`, {
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

  if (!response.results || response.results.length === 0) return null;

  const page = response.results[0];
  const properties = page.properties;
  const pageId = page.id;
  const title = properties.Name?.title?.[0]?.plain_text || 'Untitled';

  // 从页面 blocks 获取内容
  const content = await getPageBlocks(pageId);

  return {
    slug,
    title,
    date: properties.Date?.date?.start || new Date().toISOString().split('T')[0],
    cover: properties.Cover?.url || '',
    tags: extractTags(properties.Tags),
    excerpt: properties.Excerpt?.rich_text?.[0]?.plain_text || '',
    content,
    ...mapOptionalMetadata(properties, title),
  };
}

/**
 * 获取所有标签
 */
export async function getAllTags(): Promise<string[]> {
  if (!isNotionConfigured()) {
    return [];
  }

  try {
    const response = await notionFetch<NotionDatabaseResponse>(`/databases/${DATABASE_ID}`);

    const tagsProperty = response.properties?.Tags;
    if (tagsProperty?.multi_select?.options) {
      return tagsProperty.multi_select.options.map((tag) => tag.name);
    }

    return [];
  } catch (error) {
    console.error('Error fetching tags from Notion:', error);
    return [];
  }
}
