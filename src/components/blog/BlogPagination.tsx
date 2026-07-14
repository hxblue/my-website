interface BlogPaginationProps {
  page: number;
  pageCount: number;
  onPageChange(page: number): void;
}

export default function BlogPagination({ page, pageCount, onPageChange }: BlogPaginationProps) {
  if (pageCount <= 1) return null;

  return (
    <nav className="blog-pagination" aria-label="文章分页">
      <button type="button" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
        上一页
      </button>
      {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
        <button
          key={pageNumber}
          type="button"
          className={pageNumber === page ? 'is-active' : ''}
          aria-current={pageNumber === page ? 'page' : undefined}
          onClick={() => onPageChange(pageNumber)}
        >
          {pageNumber}
        </button>
      ))}
      <button type="button" disabled={page === pageCount} onClick={() => onPageChange(page + 1)}>
        下一页
      </button>
    </nav>
  );
}
