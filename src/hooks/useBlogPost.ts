import { useCallback, useEffect, useState } from 'react';
import { getPostBySlug } from '../api/posts';
import type { BlogPost } from '../types/blog';

interface BlogPostState {
  post: BlogPost | null;
  status: 'loading' | 'ready' | 'not-found' | 'error';
  error: string | null;
  retry: () => void;
}

export function useBlogPost(slug: string | undefined): BlogPostState {
  const [requestKey, setRequestKey] = useState(0);
  const [state, setState] = useState<Omit<BlogPostState, 'retry'>>({
    post: null,
    status: 'loading',
    error: null,
  });
  const retry = useCallback(() => setRequestKey((key) => key + 1), []);

  useEffect(() => {
    let isActive = true;

    const loadPost = async () => {
      if (!slug) {
        setState({ post: null, status: 'not-found', error: null });
        return;
      }

      setState({ post: null, status: 'loading', error: null });

      try {
        const notionPost = await getPostBySlug(slug);
        if (!isActive) return;
        setState({
          post: notionPost,
          status: notionPost ? 'ready' : 'not-found',
          error: null,
        });
      } catch (error) {
        if (!isActive) return;
        console.error('Failed to sync Notion post:', error);
        setState({
          post: null,
          status: 'error',
          error: '无法从 Notion 加载文章，请检查网络后重试。',
        });
      }
    };

    void loadPost();

    return () => {
      isActive = false;
    };
  }, [requestKey, slug]);

  return { ...state, retry };
}
