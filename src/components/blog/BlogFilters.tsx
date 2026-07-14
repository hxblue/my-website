import type { BlogFilterState } from '../../types/blog';

interface BlogFiltersProps {
  value: BlogFilterState;
  tags: string[];
  categories: string[];
  resultCount: number;
  onChange(next: BlogFilterState): void;
  onReset(): void;
}

export default function BlogFilters({
  value,
  tags,
  categories,
  resultCount,
  onChange,
  onReset,
}: BlogFiltersProps) {
  const hasFilters = Boolean(value.query || value.tag || value.category || value.archiveMonth);

  return (
    <section className="blog-filters" aria-labelledby="blog-filter-title">
      <div className="blog-filters__heading">
        <div>
          <p className="blog-eyebrow">EXPLORE NOTES</p>
          <h2 id="blog-filter-title">文章与笔记</h2>
        </div>
        <p aria-live="polite">找到 {resultCount} 篇</p>
      </div>

      <label className="blog-search">
        <span>搜索</span>
        <input
          type="search"
          value={value.query}
          placeholder="标题、摘要或标签"
          onChange={(event) => onChange({ ...value, query: event.target.value })}
        />
      </label>

      {tags.length > 0 && (
        <div id="tags" className="blog-filter-group">
          <span>标签</span>
          <div>
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                className={value.tag === tag ? 'is-active' : ''}
                aria-pressed={value.tag === tag}
                onClick={() => onChange({ ...value, tag: value.tag === tag ? null : tag })}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {categories.length > 0 && (
        <div id="categories" className="blog-filter-group">
          <span>分类</span>
          <div>
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={value.category === category ? 'is-active' : ''}
                aria-pressed={value.category === category}
                onClick={() =>
                  onChange({
                    ...value,
                    category: value.category === category ? null : category,
                  })
                }
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

      {hasFilters && (
        <button type="button" className="blog-reset-button" onClick={onReset}>
          清除全部筛选
        </button>
      )}
    </section>
  );
}
