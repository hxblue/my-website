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

export interface BlogPost extends BlogMeta {
  content: string;
}

export interface BlogFilterState {
  query: string;
  tag: string | null;
  category: string | null;
  archiveMonth: string | null;
}

export interface BlogArchive {
  key: string;
  label: string;
  count: number;
}

export interface BlogIndexStats {
  postCount: number;
  tagCounts: Record<string, number>;
  categoryCounts: Record<string, number>;
  archives: BlogArchive[];
  recentPosts: BlogMeta[];
}

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
  line: number;
}

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
