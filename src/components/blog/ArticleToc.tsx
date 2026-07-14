import type { TocItem } from '../../types/blog';

interface ArticleTocProps {
  items: TocItem[];
  activeId: string | null;
}

const TocLinks = ({ items, activeId }: ArticleTocProps) => (
  <ol>
    {items.map((item) => (
      <li key={`${item.line}-${item.id}`} className={`level-${item.level}`}>
        <a href={`#${item.id}`} aria-current={activeId === item.id ? 'location' : undefined}>
          {item.text}
        </a>
      </li>
    ))}
  </ol>
);

export default function ArticleToc({ items, activeId }: ArticleTocProps) {
  if (items.length === 0) return null;

  return (
    <>
      <nav className="article-toc article-toc--desktop" aria-label="文章目录">
        <p>目录</p>
        <TocLinks items={items} activeId={activeId} />
      </nav>
      <details className="article-toc article-toc--mobile">
        <summary>文章目录 · {items.length} 节</summary>
        <nav aria-label="移动端文章目录">
          <TocLinks items={items} activeId={activeId} />
        </nav>
      </details>
    </>
  );
}
