import { supabase } from '../lib/supabase';
import type { Comment, CommentFormData } from '../types/comment';

// 敏感词列表（简化版）
const SENSITIVE_WORDS = [
  '反动', '色情', '赌博', '毒品', '暴力',
  'fuck', 'shit', 'bitch', 'damn'
];

function containsSensitiveWords(text: string): boolean {
  const lowerText = text.toLowerCase();
  return SENSITIVE_WORDS.some(word => lowerText.includes(word.toLowerCase()));
}

export async function getComments(blogSlug: string): Promise<Comment[]> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('blog_slug', blogSlug)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching comments:', error);
    throw new Error('Failed to fetch comments');
  }

  return data || [];
}

export async function createComment(
  blogSlug: string,
  formData: CommentFormData
): Promise<{ comment: Comment; isPending: boolean }> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const hasSensitiveWords =
    containsSensitiveWords(formData.nickname) ||
    containsSensitiveWords(formData.content);

  const { data, error } = await supabase
    .from('comments')
    .insert([
      {
        blog_slug: blogSlug,
        nickname: formData.nickname.trim(),
        content: formData.content.trim(),
        status: hasSensitiveWords ? 'pending' : 'approved',
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating comment:', error);
    throw new Error('Failed to create comment');
  }

  return {
    comment: data,
    isPending: hasSensitiveWords,
  };
}
