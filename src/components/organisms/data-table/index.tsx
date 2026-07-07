"use client";

import { useMemo, useState } from "react";

import { ArrowDown2, ArrowUp2, SearchNormal1 } from "iconsax-react";

import { Input } from "@/components/atoms/input";
import { Skeleton } from "@/components/atoms/skeleton";

export type Column<T> = {
  /** Stable id for the column (used for sort state). */
  key: string;
  header: string;
  /** Cell content. Defaults to String((row as any)[key]). */
  render?: (row: T) => React.ReactNode;
  /** Return a comparable value to enable sorting on this column. */
  sortValue?: (row: T) => string | number;
  /** Text contributed to the global search. */
  searchValue?: (row: T) => string;
  align?: "left" | "right";
  className?: string;
};

type Props<T> = {
  data: T[];
  columns: Column<T>[];
  getRowKey: (row: T) => string | number;
  isLoading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  pageSize?: number;
  emptyText?: string;
};

export function DataTable<T>({
  data,
  columns,
  getRowKey,
  isLoading,
  searchable = true,
  searchPlaceholder = "Search…",
  pageSize = 10,
  emptyText = "No data.",
}: Props<T>) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    const searchers = columns.filter((c) => c.searchValue);
    return data.filter((row) =>
      searchers.some((c) => c.searchValue!(row).toLowerCase().includes(q)),
    );
  }, [data, columns, query]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return filtered;
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  }, [filtered, columns, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pageCount - 1);
  const rows = sorted.slice(current * pageSize, current * pageSize + pageSize);

  const toggleSort = (col: Column<T>) => {
    if (!col.sortValue) return;
    if (sortKey === col.key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(col.key);
      setSortDir("asc");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {searchable && (
        <div className="relative max-w-xs">
          <SearchNormal1
            size={16}
            color="currentColor"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            placeholder={searchPlaceholder}
            className="pl-9"
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={
                    "px-4 py-3 font-medium " +
                    (c.align === "right" ? "text-right " : "") +
                    (c.sortValue ? "cursor-pointer select-none hover:text-foreground " : "") +
                    (c.className ?? "")
                  }
                  onClick={() => toggleSort(c)}
                >
                  <span className={"inline-flex items-center gap-1 " + (c.align === "right" ? "flex-row-reverse" : "")}>
                    {c.header}
                    {sortKey === c.key &&
                      (sortDir === "asc" ? (
                        <ArrowUp2 size={12} color="currentColor" />
                      ) : (
                        <ArrowDown2 size={12} color="currentColor" />
                      ))}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3" colSpan={columns.length}>
                    <Skeleton className="h-5 w-full" />
                  </td>
                </tr>
              ))}

            {!isLoading &&
              rows.map((row) => (
                <tr key={getRowKey(row)} className="hover:bg-muted/20">
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={"px-4 py-3 " + (c.align === "right" ? "text-right " : "") + (c.className ?? "")}
                    >
                      {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}

            {!isLoading && rows.length === 0 && (
              <tr>
                <td className="px-4 py-10 text-center text-muted-foreground" colSpan={columns.length}>
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && sorted.length > pageSize && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {current * pageSize + 1}–{Math.min((current + 1) * pageSize, sorted.length)} of{" "}
            {sorted.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={current === 0}
              className="rounded-lg border border-border px-3 py-1 disabled:opacity-40 enabled:hover:bg-accent"
            >
              Prev
            </button>
            <span>
              {current + 1} / {pageCount}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={current >= pageCount - 1}
              className="rounded-lg border border-border px-3 py-1 disabled:opacity-40 enabled:hover:bg-accent"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
