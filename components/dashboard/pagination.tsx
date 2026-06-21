"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, totalPages } from "@/lib/utils";

export function PaginationControls({
  page,
  total,
  limit,
  onPageChange,
}: {
  page: number;
  total?: number;
  limit?: number;
  onPageChange: (page: number) => void;
}) {
  const pages = totalPages(total, limit);
  const visible = pages <= 6 ? Array.from({ length: pages }, (_, index) => index + 1) : [1, 2, 0, pages - 1, pages];

  return (
    <div className="flex flex-wrap justify-end gap-2 pt-6">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded border-border"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="size-4" />
      </Button>
      {visible.map((item, index) =>
        item === 0 ? (
          <span
            key={`ellipsis-${index}`}
            className="grid h-8 w-8 place-items-center rounded border border-border bg-white text-sm"
          >
            ...
          </span>
        ) : (
          <Button
            key={item}
            variant="outline"
            size="icon"
            className={cn(
              "h-8 w-8 rounded border-border bg-white text-sm",
              page === item && "border-primary text-cyan-600"
            )}
            onClick={() => onPageChange(item)}
          >
            {item}
          </Button>
        )
      )}
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded border-border"
        disabled={page >= pages}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
