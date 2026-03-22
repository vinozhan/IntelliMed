import EmptyState from './EmptyState';
import { SkeletonTable } from './Skeleton';
import Pagination from './Pagination';

export default function DataTable({
  columns,
  data,
  loading = false,
  emptyTitle = 'No data found',
  emptyDescription = '',
  emptyIcon,
  page,
  totalPages,
  totalItems,
  onPageChange,
  onRowClick,
}) {
  if (loading) return <SkeletonTable rows={5} cols={columns.length} />;

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <EmptyState title={emptyTitle} description={emptyDescription} icon={emptyIcon} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.map((row, idx) => (
              <tr
                key={row.id || idx}
                className={`hover:bg-slate-50/50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3.5 text-sm text-slate-700">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden divide-y divide-slate-100">
        {data.map((row, idx) => (
          <div
            key={row.id || idx}
            className={`p-4 space-y-2 ${onRowClick ? 'cursor-pointer hover:bg-slate-50' : ''}`}
            onClick={() => onRowClick?.(row)}
          >
            {columns.map((col) => (
              <div key={col.key} className="flex justify-between items-center">
                <span className="text-xs font-medium text-slate-500">{col.label}</span>
                <span className="text-sm text-slate-700">
                  {col.render ? col.render(row) : row[col.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {onPageChange && totalPages > 1 && (
        <div className="border-t border-slate-100 px-4 py-3">
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
