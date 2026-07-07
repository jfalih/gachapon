"use client";

import { Skeleton } from "@/components/atoms/skeleton";
import type { RarityCount } from "@/core/api/dashboard";
import { useAdminDashboardQuery } from "@/services/hooks/apis/dashboard";

const RARITY_BADGES: Record<string, string> = {
  common: "bg-muted text-muted-foreground",
  rare: "bg-blue-500/10 text-blue-600",
  epic: "bg-violet-500/10 text-violet-600",
  legendary: "bg-amber-500/10 text-amber-600",
};

const RARITY_BARS: Record<string, string> = {
  common: "bg-slate-400",
  rare: "bg-blue-500",
  epic: "bg-violet-500",
  legendary: "bg-amber-400",
};

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export function DashboardHomePage() {
  const { data, isLoading } = useAdminDashboardQuery();

  if (isLoading || !data) {
    return (
      <div className="flex flex-col gap-5">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const { totals, today, rarity_breakdown, top_items, top_spenders, recent_pulls } = data;
  const totalRarityPulls = rarity_breakdown.reduce((acc, r) => acc + r.count, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Gachapon at a glance — refreshes every 30 seconds
        </p>
      </div>

      {/* ── lifetime totals ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Players" value={totals.players.toLocaleString()} icon="🧙" />
        <StatCard
          label="Active events"
          value={`${totals.active_events} / ${totals.events}`}
          icon="🎪"
          hint="active / total"
        />
        <StatCard label="Total pulls" value={totals.pulls.toLocaleString()} icon="🎰" />
        <StatCard
          label="Coins spent"
          value={`🪙 ${totals.coins_spent.toLocaleString()}`}
          icon="💸"
          hint={`in circulation: 🪙 ${totals.coins_in_circulation.toLocaleString()}`}
        />
      </div>

      {/* ── today ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Pulls today" value={today.pulls.toLocaleString()} icon="⏱" small />
        <StatCard
          label="Coins spent today"
          value={`🪙 ${today.coins_spent.toLocaleString()}`}
          icon="⏱"
          small
        />
        <StatCard label="New players today" value={today.new_players.toLocaleString()} icon="✨" small />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* ── rarity breakdown ── */}
        <Panel title="Pulls by rarity">
          {rarity_breakdown.length === 0 && <Empty />}
          <div className="flex flex-col gap-3">
            {rarity_breakdown.map((r) => (
              <RarityBar key={r.rarity} rarity={r} total={totalRarityPulls} />
            ))}
          </div>
        </Panel>

        {/* ── top items ── */}
        <Panel title="Most-won items">
          {top_items.length === 0 && <Empty />}
          <ol className="flex flex-col gap-2">
            {top_items.map((it, i) => (
              <li key={`${it.item_name}-${it.item_rarity}`} className="flex items-center gap-3 text-sm">
                <span className="w-5 text-right font-mono text-muted-foreground">{i + 1}.</span>
                <span className="flex-1 font-medium text-foreground">{it.item_name}</span>
                <span
                  className={
                    "rounded-full px-2 py-0.5 text-[11px] font-bold capitalize " +
                    (RARITY_BADGES[it.item_rarity] ?? RARITY_BADGES.common)
                  }
                >
                  {it.item_rarity}
                </span>
                <span className="w-14 text-right text-muted-foreground">{it.count}×</span>
              </li>
            ))}
          </ol>
        </Panel>

        {/* ── top spenders ── */}
        <Panel title="Top spenders">
          {top_spenders.length === 0 && <Empty />}
          <ol className="flex flex-col gap-2">
            {top_spenders.map((s, i) => (
              <li key={s.user_id} className="flex items-center gap-3 text-sm">
                <span className="w-5 text-right font-mono text-muted-foreground">{i + 1}.</span>
                <span className="flex-1">
                  <span className="block font-medium text-foreground">{s.full_name || "—"}</span>
                  <span className="block text-xs text-muted-foreground">{s.email}</span>
                </span>
                <span className="text-muted-foreground">{s.pulls} pull(s)</span>
                <span className="w-20 text-right font-medium text-foreground">
                  🪙 {s.coins_spent.toLocaleString()}
                </span>
              </li>
            ))}
          </ol>
        </Panel>

        {/* ── recent pulls ── */}
        <Panel title="Latest pulls">
          {recent_pulls.length === 0 && <Empty />}
          <ol className="flex flex-col gap-2">
            {recent_pulls.map((h) => (
              <li key={h.id} className="flex items-center gap-3 text-sm">
                <span className="w-24 shrink-0 text-xs text-muted-foreground">
                  {formatDateTime(h.created_at)}
                </span>
                <span className="min-w-0 flex-1 truncate text-muted-foreground">{h.user_email}</span>
                <span className="font-medium text-foreground">{h.item_name}</span>
                <span
                  className={
                    "rounded-full px-2 py-0.5 text-[11px] font-bold capitalize " +
                    (RARITY_BADGES[h.item_rarity] ?? RARITY_BADGES.common)
                  }
                >
                  {h.item_rarity}
                </span>
              </li>
            ))}
          </ol>
        </Panel>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  hint,
  small,
}: {
  label: string;
  value: string;
  icon: string;
  hint?: string;
  small?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {icon} {label}
      </p>
      <p className={(small ? "text-xl" : "text-2xl") + " font-semibold text-foreground"}>{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border p-5">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function RarityBar({ rarity, total }: { rarity: RarityCount; total: number }) {
  const pct = total > 0 ? (rarity.count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-20 capitalize text-muted-foreground">{rarity.rarity}</span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={"h-full rounded-full " + (RARITY_BARS[rarity.rarity] ?? RARITY_BARS.common)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-20 text-right text-muted-foreground">
        {rarity.count} ({pct.toFixed(1)}%)
      </span>
    </div>
  );
}

function Empty() {
  return <p className="text-sm text-muted-foreground">No pulls yet.</p>;
}
