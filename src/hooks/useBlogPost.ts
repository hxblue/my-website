import { useEffect, useState } from 'react';
import { getPostBySlug } from '../api/posts';
import type { BlogPost } from '../types/blog';
import { parseMarkdown } from '../utils/markdown';

interface BlogPostState {
  post: BlogPost | null;
  status: 'loading' | 'ready' | 'not-found';
  usingFallback: boolean;
}

export function useBlogPost(slug: string | undefined): BlogPostState {
  const [state, setState] = useState<BlogPostState>({
    post: null,
    status: 'loading',
    usingFallback: false,
  });

  useEffect(() => {
    let isActive = true;

    const loadPost = async () => {
      if (!slug) {
        setState({ post: null, status: 'not-found', usingFallback: false });
        return;
      }

      setState({ post: null, status: 'loading', usingFallback: false });

      const remotePost = await getPostBySlug(slug).catch(() => null);
      if (!isActive) return;

      if (remotePost) {
        setState({ post: remotePost, status: 'ready', usingFallback: false });
        return;
      }

      const fallbackPost = await parseMarkdown(slug);
      if (!isActive) return;

      setState({
        post: fallbackPost,
        status: fallbackPost ? 'ready' : 'not-found',
        usingFallback: Boolean(fallbackPost),
      });
    };

    void loadPost();

    return () => {
      isActive = false;
    };
  }, [slug]);

  return state;
}
