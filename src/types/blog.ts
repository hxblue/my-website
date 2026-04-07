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
