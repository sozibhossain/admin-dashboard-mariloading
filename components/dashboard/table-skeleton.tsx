import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton({ rows = 8, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="rounded-lg border border-border bg-card">
      {Array.from({ length: rows }).map((_, row) => (
        <div
          key={row}
          className="grid gap-6 border-b border-table-line p-5 last:border-b-0"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(120px, 1fr))` }}
        >
          {Array.from({ length: columns }).map((__, column) => (
            <Skeleton key={column} className="h-5 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}
