// import ReactMarkdown, { type Components } from 'react-markdown';
// import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
// import { Link } from 'react-router-dom';
// import { useMemo } from 'react';
// import type { BlogPost } from '../types/blog';
// import { useTheme } from '../hooks/useTheme';

// interface BlogDetailProps {
//   post: BlogPost;
// }

// const BlogDetail = ({ post }: BlogDetailProps) => {
//   const { theme } = useTheme();
//   const markdownComponents = useMemo<Components>(
//     () => ({
//       code({ className, children, ...props }) {
//         const match = /language-(\w+)/.exec(className || '');

//         return match ? (
//           <SyntaxHighlighter style={theme === 'dark' ? oneDark : oneLight} language={match[1]} PreTag="div">
//             {String(children).replace(/\n$/, '')}
//           </SyntaxHighlighter>
//         ) : (
//           <code className={className} {...props}>
//             {children}
//           </code>
//         );
//       },
//     }),
//     [theme],
//   );

//   return (
//     <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
//       <Link to="/blog" className="editorial-link text-sm">
//         ← 返回博客列表
//       </Link>

//       <header className="mt-14 border-b border-line pb-10">
//         <p className="meta-label">{post.tags.join(' · ')}</p>
//         <h1 className="mt-5 font-serif text-5xl font-semibold leading-[1.08] sm:text-7xl">{post.title}</h1>
//         <time dateTime={post.date} className="mt-6 block font-mono text-sm text-muted">
//           {new Date(post.date).toLocaleDateString('zh-CN', {
//             year: 'numeric',
//             month: 'long',
//             day: 'numeric',
//           })}
//         </time>
//       </header>

//       <div className="prose prose-lg mt-12 max-w-none">
//         <ReactMarkdown components={markdownComponents}>{post.content}</ReactMarkdown>
//       </div>
//     </article>
//   );
// };

// export default BlogDetail;
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { Link } from "react-router-dom";
import { useMemo } from "react";
import type { BlogPost } from "../types/blog";
import { useTheme } from "../hooks/useTheme";

interface BlogDetailProps {
  post: BlogPost;
}

const BlogDetail = ({ post }: BlogDetailProps) => {
  const { theme } = useTheme();

  const markdownComponents = useMemo<Components>(
    () => ({
      code({ className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || "");

        return match ? (
          <SyntaxHighlighter
            style={theme === "dark" ? oneDark : oneLight}
            language={match[1]}
            PreTag="div"
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        ) : (
          <code className={className} {...props}>
            {children}
          </code>
        );
      },

      a({ href, children, ...props }) {
        const isExternal = href?.startsWith("http");

        return (
          <a
            href={href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className="text-blue-600 underline underline-offset-4 hover:text-blue-800"
            {...props}
          >
            {children}
          </a>
        );
      },
    }),
    [theme],
  );

  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Link to="/blog" className="editorial-link text-sm">
        ← 返回博客列表
      </Link>

      <header className="mt-14 border-b border-line pb-10">
        <p className="meta-label">{post.tags.join(" · ")}</p>
        <h1 className="mt-5 font-serif text-5xl font-semibold leading-[1.08] sm:text-7xl">
          {post.title}
        </h1>
        <time
          dateTime={post.date}
          className="mt-6 block font-mono text-sm text-muted"
        >
          {new Date(post.date).toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
      </header>

      <div className="prose prose-lg mt-12 max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={markdownComponents}
        >
          {post.content}
        </ReactMarkdown>
      </div>
    </article>
  );
};

export default BlogDetail;
