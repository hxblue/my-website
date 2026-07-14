import { useEffect, useState } from 'react';
import { getPublishedPosts } from '../api/posts';
import { blogs as fallbackBlogs } from '../data/blogs';
import type { BlogMeta } from '../types/blog';

interface PublishedPostsState {
  posts: BlogMeta[];
  status: 'loading' | 'ready';
  usingFallback: boolean;
}

export function usePublishedPosts(): PublishedPostsState {
  const [state, setState] = useState<PublishedPostsState>({
    posts: fallbackBlogs,
    status: 'loading',
    usingFallback: true,
  });

  useEffect(() => {
    let isActive = true;

    getPublishedPosts()
      .then((notionPosts) => {
        if (!isActive) return;
        setState({
          posts: notionPosts.length > 0 ? notionPosts : fallbackBlogs,
          status: 'ready',
          usingFallback: notionPosts.length === 0,
        });
      })
      .catch(() => {
        if (isActive) {
          setState({ posts: fallbackBlogs, status: 'ready', usingFallback: true });
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  return state;
}
