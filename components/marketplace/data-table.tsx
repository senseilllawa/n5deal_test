import type { ReactNode } from "react";

export interface DataTableColumn<T> {
  header: string;
  cell: (row: T) => ReactNode;
  /** Right-aligns a column — use for numbers/dates/actions. */
  align?: "left" | "right";
}

/**
 * Shared by /manager/users and /manager/assets — a column-config table
 * instead of two near-identical hand-written <table> markups. `actions`
 * renders per-row moderation buttons in a trailing column when given.
 */
export function DataTable<T extends { id: string }>({
  columns,
  rows,
  actions,
  emptyMessage = "Nothing to show.",
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  actions?: (row: T) => ReactNode;
  emptyMessage?: string;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            {columns.map((col) => (
              <th
                key={col.header}
                className={`px-4 py-2 text-left font-medium text-muted-foreground ${col.align === "right" ? "text-right" : ""}`}
              >
                {col.header}
              </th>
            ))}
            {actions && <th className="px-4 py-2 text-right font-medium text-muted-foreground">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b transition-colors last:border-0 hover:bg-muted/30">
              {columns.map((col) => (
                <td key={col.header} className={`px-4 py-3 ${col.align === "right" ? "text-right" : ""}`}>
                  {col.cell(row)}
                </td>
              ))}
              {actions && <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">{actions(row)}</div>
              </td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
