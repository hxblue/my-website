import { BlogPost } from '../types/blog';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Calendar, Tag, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BlogDetailProps {
  post: BlogPost;
}

const BlogDetail = ({ post }: BlogDetailProps) => {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Link */}
      <Link
        to="/blog"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors mb-8"
      >
        <ArrowLeft size={20} />
        返回博客列表
      </Link>

      {/* Header */}
      <header className="mb-8">
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-purple-500/20 text-purple-300 rounded-full"
            >
              <Tag size={14} />
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
          {post.title}
        </h1>

        {/* Date */}
        <div className="flex items-center gap-2 text-gray-400">
          <Calendar size={18} />
          <time>{new Date(post.date).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</time>
        </div>
      </header>

      {/* Cover Image */}
      <div className="aspect-video rounded-xl overflow-hidden mb-8 bg-gray-800">
        <img
          src={post.cover}
          alt={post.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="prose prose-invert prose-lg max-w-none">
        <ReactMarkdown
          components={{
            code({ className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              const language = match ? match[1] : '';

              if (language) {
                return (
                  <SyntaxHighlighter
                    style={oneDark}
                    language={language}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                );
              }

              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {post.content}
        </ReactMarkdown>
      </div>
    </article>
  );
};

export default BlogDetail;
