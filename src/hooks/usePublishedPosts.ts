import { useCallback, useEffect, useState } from 'react';
import { getPublishedPosts } from '../api/posts';
import type { BlogMeta } from '../types/blog';

interface PublishedPostsState {
  posts: BlogMeta[];
  status: 'loading' | 'ready' | 'error';
  error: string | null;
  retry: () => void;
}

export function usePublishedPosts(): PublishedPostsState {
  const [requestKey, setRequestKey] = useState(0);
  const [state, setState] = useState<Omit<PublishedPostsState, 'retry'>>({
    posts: [],
    status: 'loading',
    error: null,
  });
  const retry = useCallback(() => {
    setState({ posts: [], status: 'loading', error: null });
    setRequestKey((key) => key + 1);
  }, []);

  useEffect(() => {
    let isActive = true;

    getPublishedPosts()
      .then((notionPosts) => {
        if (!isActive) return;
        setState({ posts: notionPosts, status: 'ready', error: null });
      })
      .catch((error: unknown) => {
        if (!isActive) return;
        console.error('Failed to sync Notion posts:', error);
        setState({
          posts: [],
          status: 'error',
          error: '无法连接 Notion，请检查网络后重试。',
        });
      });

    return () => {
      isActive = false;
    };
  }, [requestKey]);

  return { ...state, retry };
}
