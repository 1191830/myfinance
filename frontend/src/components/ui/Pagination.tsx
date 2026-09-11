interface PaginationProps {
  page: number; // 1-based
  pageCount: number;
  total: number;
  pageSize: number;
  onPage: (page: number) => void;
}

const Arrow = ({ dir }: { dir: 'left' | 'right' }) => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={dir === 'left' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'} />
  </svg>
);

const pageWindow = (page: number, pageCount: number): (number | '…')[] => {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const out: (number | '…')[] = [1];
  const lo = Math.max(2, page - 1);
  const hi = Math.min(pageCount - 1, page + 1);
  if (lo > 2) out.push('…');
  for (let i = lo; i <= hi; i += 1) out.push(i);
  if (hi < pageCount - 1) out.push('…');
  out.push(pageCount);
  return out;
};

export const Pagination = ({ page, pageCount, total, pageSize, onPage }: PaginationProps) => {
  if (pageCount <= 1) return null;
  const first = (page - 1) * pageSize + 1;
  const last = Math.min(total, page * pageSize);
  const cellBase =
    'flex h-7 min-w-[28px] items-center justify-center rounded-control border px-2 text-xs';

  return (
    <div className="flex items-center justify-between border-t border-line-soft px-5 py-3">
      <span className="text-xs text-faint">
        {first}–{last} de {total}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => onPage(page - 1)}
          className={`${cellBase} border-[#d7dbe0] bg-white text-muted disabled:opacity-40`}
        >
          <Arrow dir="left" />
        </button>
        {pageWindow(page, pageCount).map((p, i) =>
          p === '…' ? (
            <span key={`gap-${i}`} className="px-1 text-xs text-faint">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPage(p)}
              className={`${cellBase} ${
                p === page
                  ? 'border-brand bg-brand font-medium text-white'
                  : 'border-[#d7dbe0] bg-white text-muted'
              }`}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          disabled={page === pageCount}
          onClick={() => onPage(page + 1)}
          className={`${cellBase} border-[#d7dbe0] bg-white text-muted disabled:opacity-40`}
        >
          <Arrow dir="right" />
        </button>
      </div>
    </div>
  );
};
