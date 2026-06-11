import { useState, useRef } from 'react';
import type { CommentFormData } from '../types/comment';

interface CommentFormProps {
  onSubmit: (data: CommentFormData) => Promise<{ success: boolean; isPending: boolean; message: string }>;
}

export default function CommentForm({ onSubmit }: CommentFormProps) {
  const [nickname, setNickname] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const lastSubmitTime = useRef<number>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nickname.trim() || !content.trim()) {
      setMessage({ type: 'error', text: '请填写昵称和留言内容' });
      return;
    }

    if (nickname.trim().length > 50) {
      setMessage({ type: 'error', text: '昵称不能超过50个字符' });
      return;
    }

    if (content.trim().length > 500) {
      setMessage({ type: 'error', text: '留言内容不能超过500个字符' });
      return;
    }

    const now = Date.now();
    if (now - lastSubmitTime.current < 30000) {
      setMessage({ type: 'error', text: '提交太频繁，请稍后再试' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const result = await onSubmit({
        nickname: nickname.trim(),
        content: content.trim(),
      });

      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setNickname('');
        setContent('');
        lastSubmitTime.current = now;
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch {
      setMessage({ type: 'error', text: '提交失败，请重试' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-medium">发表评论</h3>

      <div>
        <label htmlFor="nickname" className="mb-1 block text-sm text-muted">
          昵称 <span className="text-accent">*</span>
        </label>
        <input
          type="text"
          id="nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={50}
          placeholder="你的昵称"
          className="w-full border border-line bg-surface px-4 py-3 outline-none focus:border-accent"
        />
      </div>

      <div>
        <label htmlFor="content" className="mb-1 block text-sm text-muted">
          留言内容 <span className="text-accent">*</span>
          <span className="ml-2 text-xs">({content.length}/500)</span>
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={500}
          rows={4}
          placeholder="写下你的想法..."
          className="w-full resize-none border border-line bg-surface px-4 py-3 outline-none focus:border-accent"
        />
      </div>

      {message && (
        <div className={`border-l-2 p-3 text-sm ${message.type === 'success' ? 'border-[#1B7F5A]' : 'border-accent'}`}>
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="border border-action bg-action px-6 py-2.5 text-sm font-medium text-action-text transition-colors hover:border-accent hover:bg-accent disabled:cursor-not-allowed disabled:border-[#B8B8B2] disabled:bg-[#B8B8B2]"
      >
        {isSubmitting ? '提交中...' : '发表评论'}
      </button>
    </form>
  );
}
