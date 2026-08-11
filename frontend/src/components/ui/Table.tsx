import type { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

interface Column<T> {
  key:    string
  header: ReactNode
  render: (row: T) => ReactNode
  width?: string
  align?: 'left' | 'center' | 'right'
}

interface TableProps<T> {
  columns:     Column<T>[]
  data:        T[]
  loading?:    boolean
  emptyText?:  string
  rowKey?:     (row: T) => string | number
  onRowClick?: (row: T) => void
}

export function Table<T>({ columns, data, loading, emptyText, rowKey, onRowClick }: TableProps<T>) {
  const getKey = (row: T, i: number): string | number =>
    rowKey ? rowKey(row) : i
  return (
    <div className="gc-table-wrap">
      <div className="gc-table-scroll">
        <table className="gc-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  className={col.align && col.align !== 'left' ? `align-${col.align}` : ''}
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className="gc-table-loading">
                    <Loader2 size={18} style={{ animation: 'spinGold 0.7s linear infinite' }} />
                    <span>Chargement...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="gc-table-empty">
                  <div className="gc-table-empty-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4A017" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M3 9h18M9 21V9" />
                    </svg>
                  </div>
                  <p>{emptyText ?? 'Aucun résultat'}</p>
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={getKey(row, i)}
                  className={onRowClick ? 'clickable' : ''}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map(col => (
                    <td
                      key={col.key}
                      className={col.align && col.align !== 'left' ? `align-${col.align}` : ''}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* Pagination */
interface PaginationProps {
  current_page?: number
  last_page?:    number
  onPageChange?: (page: number) => void
}

export function Pagination({ current_page = 1, last_page = 1, onPageChange }: PaginationProps) {
  if (last_page <= 1) return null
  return (
    <div className="gc-pagination">
      {Array.from({ length: last_page }, (_, i) => i + 1).map(p => (
        <button
          key={p}
          className={`gc-page-btn${p === current_page ? ' active' : ''}`}
          onClick={() => onPageChange?.(p)}
        >
          {p}
        </button>
      ))}
    </div>
  )
}

export default Table
