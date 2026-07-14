import type {
  BlogFilterState,
  BlogIndexStats,
  BlogMeta,
  TocItem,
} from '../types/blog';

export const BLOG_PAGE_SIZE = 10;

const toTimestamp = (value?: string) => {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

export function sortPostsByDate(posts: BlogMeta[]): BlogMeta[] {
  return [...posts].sort((a, b) => toTimestamp(b.date) - toTimestamp(a.date));
}

export function buildBlogIndexStats(posts: BlogMeta[]): BlogIndexStats {
  const sortedPosts = sortPostsByDate(posts);
  const tagCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};
  const archiveCounts = new Map<string, number>();

  sortedPosts.forEach((post) => {
    post.tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    });

    if (post.category) {
      categoryCounts[post.category] = (categoryCounts[post.category] ?? 0) + 1;
    }

    const archiveKey = post.date.slice(0, 7);
    if (/^\d{4}-\d{2}$/.test(archiveKey)) {
      archiveCounts.set(archiveKey, (archiveCounts.get(archiveKey) ?? 0) + 1);
    }
  });

  const archives = Array.from(archiveCounts.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, count]) => {
      const [year, month] = key.split('-').map(Number);
      return {
        key,
        label: new Intl.DateTimeFormat('zh-CN', {
          year: 'numeric',
          month: 'long',
        }).format(new Date(year, month - 1, 1)),
        count,
      };
    });

  return {
    postCount: posts.length,
    tagCounts,
    categoryCounts,
    archives,
    recentPosts: sortedPosts.slice(0, 5),
  };
}

export function filterPosts(posts: BlogMeta[], filters: BlogFilterState): BlogMeta[] {
  const query = filters.query.trim().toLocaleLowerCase('zh-CN');

  return posts.filter((post) => {
    const searchableText = [post.title, post.excerpt, post.category ?? '', ...post.tags]
      .join(' ')
      .toLocaleLowerCase('zh-CN');

    return (
      (!query || searchableText.includes(query)) &&
      (!filters.tag || post.tags.includes(filters.tag)) &&
      (!filters.category || post.category === filters.category) &&
      (!filters.archiveMonth || post.date.startsWith(filters.archiveMonth))
    );
  });
}

export function paginatePosts(
  posts: BlogMeta[],
  page: number,
  pageSize = BLOG_PAGE_SIZE,
): BlogMeta[] {
  const safePage = Math.max(1, page);
  const start = (safePage - 1) * pageSize;
  return posts.slice(start, start + pageSize);
}

export function getPageCount(total: number, pageSize = BLOG_PAGE_SIZE): number {
  return Math.max(1, Math.ceil(total / pageSize));
}

export function estimateReadingMinutes(markdown: string): number {
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, ' ');
  const plainText = withoutCode
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_~`|-]/g, ' ');
  const chineseCharacters = plainText.match(/[\u3400-\u9fff]/g)?.length ?? 0;
  const latinWords = plainText.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g)?.length ?? 0;

  return Math.max(1, Math.ceil(chineseCharacters / 300 + latinWords / 200));
}

export function slugifyHeading(text: string): string {
  const normalized = text
    .trim()
    .toLocaleLowerCase('zh-CN')
    .replace(/<[^>]+>/g, '')
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return normalized || 'section';
}

export function extractMarkdownHeadings(markdown: string): TocItem[] {
  const headings: TocItem[] = [];
  const slugCounts = new Map<string, number>();
  let inFence = false;

  markdown.split(/\r?\n/).forEach((line, index) => {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      return;
    }

    if (inFence) return;

    const match = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) return;

    const level = match[1].length as 2 | 3;
    const text = match[2]
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/[*_~`]/g, '')
      .trim();
    const baseSlug = slugifyHeading(text);
    const occurrence = slugCounts.get(baseSlug) ?? 0;
    slugCounts.set(baseSlug, occurrence + 1);

    headings.push({
      id: occurrence === 0 ? baseSlug : `${baseSlug}-${occurrence + 1}`,
      text,
      level,
      line: index + 1,
    });
  });

  return headings;
}

export const formatBlogDate = (date: string) =>
  new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
