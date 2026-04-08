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

    // 基本验证
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

    // 速率限制：30秒内只能提交一次
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
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        发表评论
      </h3>

      <div>
        <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          昵称 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={50}
          placeholder="你的昵称"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          留言内容 <span className="text-red-500">*</span>
          <span className="text-xs text-gray-500 ml-2">({content.length}/500)</span>
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={500}
          rows={4}
          placeholder="写下你的想法..."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     placeholder-gray-400 dark:placeholder-gray-500 resize-none"
        />
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
          }`}
        >
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700
                   disabled:bg-gray-400 disabled:cursor-not-allowed
                   text-white font-medium rounded-lg transition-colors
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                   dark:focus:ring-offset-gray-900"
      >
        {isSubmitting ? '提交中...' : '发表评论'}
      </button>
    </form>
  );
}
