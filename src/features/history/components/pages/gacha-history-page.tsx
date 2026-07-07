"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/atoms/button";
import { DataTable, type Column } from "@/components/organisms/data-table";
import type { GachaHistoryEntry } from "@/core/api/history";
import { useAdminHistoryQuery } from "@/services/hooks/apis/history";

const PAGE_SIZE = 20;

const RARITY_BADGES: Record<string, string> = {
  common: "bg-muted text-muted-foreground",
  rare: "bg-blue-500/10 text-blue-600",
  epic: "bg-violet-500/10 text-violet-600",
  legendary: "bg-amber-500/10 text-amber-600",
};

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export function GachaHistoryPage() {
  // Server-side pagination: each page is fetched with limit/offset; the
  // DataTable only sorts/searches within the page it was given.
  const [page, setPage] = useState(0);
  const { data, isLoading, isFetching } = useAdminHistoryQuery({
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

  const rows = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const columns = useMemo<Column<GachaHistoryEntry>[]>(
    () => [
      {
        key: "created_at",
        header: "When",
        sortValue: (h) => h.created_at,
        render: (h) => (
          <span className="text-muted-foreground">{formatDateTime(h.created_at)}</span>
        ),
      },
      {
        key: "user",
        header: "User",
        sortValue: (h) => h.user_email ?? "",
        searchValue: (h) => `${h.user_email ?? ""} ${h.user_full_name ?? ""}`,
        render: (h) => (
          <div>
            <p className="font-medium text-foreground">{h.user_full_name || "—"}</p>
            <p className="text-xs text-muted-foreground">{h.user_email}</p>
          </div>
        ),
      },
      {
        key: "event_name",
        header: "Event",
        sortValue: (h) => h.event_name.toLowerCase(),
        searchValue: (h) => h.event_name,
      },
      {
        key: "item",
        header: "Prize",
        sortValue: (h) => h.item_name.toLowerCase(),
        searchValue: (h) => `${h.item_name} ${h.item_rarity}`,
        render: (h) => (
          <span className="inline-flex items-center gap-2">
            <span className="font-medium text-foreground">{h.item_name}</span>
            <span
              className={
                "rounded-full px-2 py-0.5 text-[11px] font-bold capitalize " +
                (RARITY_BADGES[h.item_rarity] ?? RARITY_BADGES.common)
              }
            >
              {h.item_rarity}
            </span>
          </span>
        ),
      },
      {
        key: "cost",
        header: "Cost",
        align: "right",
        sortValue: (h) => h.cost,
        render: (h) => <span>🪙 {h.cost.toLocaleString()}</span>,
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Gacha history</h1>
          <p className="text-sm text-muted-foreground">
            Every pull across all users · {total.toLocaleString()} pull(s)
            {isFetching && !isLoading ? " · refreshing…" : ""}
          </p>
        </div>
      </div>

      <DataTable
        data={rows}
        columns={columns}
        getRowKey={(h) => h.id}
        isLoading={isLoading}
        searchPlaceholder="Search within this page…"
        pageSize={PAGE_SIZE}
        emptyText="No pulls yet."
      />

      {/* server-side page controls (the table above shows one page at a time) */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Page {Math.min(page + 1, pageCount)} of {pageCount}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0 || isLoading}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={page >= pageCount - 1 || isLoading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
