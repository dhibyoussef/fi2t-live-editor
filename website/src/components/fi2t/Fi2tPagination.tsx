import { useMemo } from 'react'

function buildPagination(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 1) return [1]
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | 'ellipsis')[] = [1]
  if (current > 3) pages.push('ellipsis')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let page = start; page <= end; page += 1) {
    if (!pages.includes(page)) pages.push(page)
  }

  if (current < total - 2) pages.push('ellipsis')
  if (!pages.includes(total)) pages.push(total)
  return pages
}

type Fi2tPaginationProps = {
  page: number
  totalPages: number
  onPage: (page: number) => void
  ariaLabel?: string
  className?: string
}

/**
 * Numbered pager with ‹ ›. Renders nothing when there is only one page
 * (or none) — same rule as the values/objectifs dots.
 */
export default function Fi2tPagination({
  page,
  totalPages,
  onPage,
  ariaLabel = 'Pagination',
  className = 'fi2t-actu-pagination',
}: Fi2tPaginationProps) {
  const safePage = Math.min(Math.max(1, page), Math.max(1, totalPages))
  const items = useMemo(() => buildPagination(safePage, totalPages), [safePage, totalPages])

  if (totalPages <= 1) return null

  return (
    <nav className={className} aria-label={ariaLabel}>
      <button
        type="button"
        className="fi2t-actu-pagination__btn"
        aria-label="Page précédente"
        disabled={safePage <= 1}
        onClick={() => onPage(Math.max(1, safePage - 1))}
      >
        ‹
      </button>
      {items.map((item, index) =>
        item === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="fi2t-actu-pagination__ellipsis">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            className={`fi2t-actu-pagination__btn${item === safePage ? ' is-active' : ''}`}
            aria-current={item === safePage ? 'page' : undefined}
            onClick={() => onPage(item)}
          >
            {item}
          </button>
        ),
      )}
      <button
        type="button"
        className="fi2t-actu-pagination__btn"
        aria-label="Page suivante"
        disabled={safePage >= totalPages}
        onClick={() => onPage(Math.min(totalPages, safePage + 1))}
      >
        ›
      </button>
    </nav>
  )
}

/** Repeat items to fill `minPages` of `perPage` (Figma demo grids). Short real lists stay as-is. */
export function padItemsForPages<T extends { slug?: string }>(
  items: T[],
  perPage: number,
  minPages = 6,
): T[] {
  if (items.length === 0 || items.length < perPage) return items
  const target = perPage * minPages
  if (items.length >= target) return items
  const out = [...items]
  let n = 0
  while (out.length < target) {
    const src = items[n % items.length]
    n += 1
    const pageNum = Math.floor(out.length / perPage) + 1
    out.push({
      ...src,
      ...(src.slug != null ? { slug: `${src.slug}-p${pageNum}-${out.length}` } : null),
    })
  }
  return out
}
