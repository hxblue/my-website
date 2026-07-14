import { useMemo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { BlogPost } from '../types/blog';
import { extractMarkdownHeadings } from '../utils/blog';
import { useActiveHeading } from '../hooks/useActiveHeading';
import ArticleToc from './blog/ArticleToc';
import MarkdownCodeBlock from './blog/MarkdownCodeBlock';

interface BlogDetailProps {
  post: BlogPost;
}

const isExternalUrl = (href?: string) => Boolean(href && /^https?:\/\//.test(href));

const BlogDetail = ({ post }: BlogDetailProps) => {
  const headings = useMemo(() => extractMarkdownHeadings(post.content), [post.content]);
  const headingIdByLine = useMemo(
    () => new Map(headings.map((heading) => [heading.line, heading.id])),
    [headings],
  );
  const activeHeadingId = useActiveHeading(headings);

  const markdownComponents = useMemo<Components>(
    () => ({
      h2({ node, children, ...props }) {
        const id = node?.position?.start.line
          ? headingIdByLine.get(node.position.start.line)
          : undefined;
        return <h2 id={id} {...props}>{children}</h2>;
      },
      h3({ node, children, ...props }) {
        const id = node?.position?.start.line
          ? headingIdByLine.get(node.position.start.line)
          : undefined;
        return <h3 id={id} {...props}>{children}</h3>;
      },
      code({ className, children }) {
        return <MarkdownCodeBlock className={className}>{children}</MarkdownCodeBlock>;
      },
      pre({ children }) {
        return <>{children}</>;
      },
      a({ href, children, ...props }) {
        const external = isExternalUrl(href);
        return (
          <a
            href={href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            {...props}
          >
            {children}
          </a>
        );
      },
      img({ alt, ...props }) {
        return (
          <img
            alt={alt ?? ''}
            loading="lazy"
            decoding="async"
            onError={(event) => {
              event.currentTarget.classList.add('is-broken');
              event.currentTarget.setAttribute('aria-hidden', 'true');
            }}
            {...props}
          />
        );
      },
    }),
    [headingIdByLine],
  );

  return (
    <div className="article-layout">
      <article className="article-content-card">
        <div className="prose prose-lg max-w-none blog-prose">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {post.content}
          </ReactMarkdown>
        </div>
      </article>
      <aside className="article-toc-column">
        <ArticleToc items={headings} activeId={activeHeadingId} />
      </aside>
    </div>
  );
};

export default BlogDetail;
