"use client";

import { useMemo, useState } from "react";

import { Add, Trash } from "iconsax-react";

import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { DataTable, type Column } from "@/components/organisms/data-table";
import type { GachaEvent, GachaEventItemPayload, GachaEventPayload } from "@/core/api/events";
import {
  useAdminGachaEventsQuery,
  useCreateGachaEvent,
  useDeleteGachaEvent,
  useUpdateGachaEvent,
} from "@/services/hooks/apis/events";

const RARITIES = ["common", "rare", "epic", "legendary"] as const;

const RARITY_BADGES: Record<string, string> = {
  common: "bg-muted text-muted-foreground",
  rare: "bg-blue-500/10 text-blue-600",
  epic: "bg-violet-500/10 text-violet-600",
  legendary: "bg-amber-500/10 text-amber-600",
};

const rateTotal = (items: { drop_rate: number }[]) =>
  // basis points keep the 100.00% check exact despite float inputs
  items.reduce((acc, it) => acc + Math.round((Number(it.drop_rate) || 0) * 100), 0) / 100;

const apiMessage = (err: unknown) =>
  (err as { message?: string })?.message ?? "Request failed — check the form and try again.";

export function EventsListPage() {
  const { data, isLoading } = useAdminGachaEventsQuery();
  const create = useCreateGachaEvent();
  const update = useUpdateGachaEvent();
  const del = useDeleteGachaEvent();
  const [editing, setEditing] = useState<GachaEvent | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const events = data ?? [];
  const saving = create.isPending || update.isPending;

  const onSave = async (payload: GachaEventPayload) => {
    setError(null);
    try {
      if (editing === "new") await create.mutateAsync(payload);
      else if (editing) await update.mutateAsync({ id: editing.id, payload });
      setEditing(null);
    } catch (err) {
      setError(apiMessage(err));
    }
  };

  const onDelete = (e: GachaEvent) => {
    if (window.confirm(`Delete event "${e.name}"? Its items are removed too.`)) del.mutate(e.id);
  };

  const columns = useMemo<Column<GachaEvent>[]>(
    () => [
      {
        key: "name",
        header: "Event",
        sortValue: (e) => e.name.toLowerCase(),
        searchValue: (e) => `${e.name} ${e.code}`,
        render: (e) => (
          <div>
            <p className="font-medium text-foreground">{e.name}</p>
            <p className="font-mono text-xs text-muted-foreground">{e.code}</p>
          </div>
        ),
      },
      {
        key: "cost",
        header: "Cost",
        align: "right",
        sortValue: (e) => e.cost,
        render: (e) => <span>🪙 {e.cost.toLocaleString()}</span>,
      },
      {
        key: "items",
        header: "Items",
        align: "right",
        sortValue: (e) => e.items?.length ?? 0,
        render: (e) => e.items?.length ?? 0,
      },
      {
        key: "rate_total",
        header: "Rate total",
        align: "right",
        sortValue: (e) => rateTotal(e.items ?? []),
        render: (e) => {
          const total = rateTotal(e.items ?? []);
          return (
            <span className={total === 100 ? "text-emerald-600" : "font-medium text-destructive"}>
              {total.toFixed(2)}%
            </span>
          );
        },
      },
      {
        key: "is_active",
        header: "Status",
        sortValue: (e) => String(e.is_active),
        render: (e) => (
          <span
            className={
              "rounded-full px-2 py-0.5 text-[11px] font-bold " +
              (e.is_active ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground")
            }
          >
            {e.is_active ? "Active" : "Draft"}
          </span>
        ),
      },
      {
        key: "actions",
        header: "",
        align: "right",
        render: (e) => (
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="sm" onClick={() => setEditing(e)}>
              Edit
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(e)}>
              Delete
            </Button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Gacha events</h1>
          <p className="text-sm text-muted-foreground">
            Banners, prize items and drop rates · {events.length} event(s)
          </p>
        </div>
        <Button
          onClick={() => {
            setError(null);
            setEditing("new");
          }}
        >
          <Add size={18} color="currentColor" /> Add event
        </Button>
      </div>

      {editing && (
        <EventForm
          key={editing === "new" ? "new" : editing.id}
          initial={editing === "new" ? undefined : editing}
          saving={saving}
          error={error}
          onCancel={() => {
            setError(null);
            setEditing(null);
          }}
          onSubmit={onSave}
        />
      )}

      <DataTable
        data={events}
        columns={columns}
        getRowKey={(e) => e.id}
        isLoading={isLoading}
        searchPlaceholder="Search events…"
        emptyText="No gacha events yet."
      />
    </div>
  );
}

type ItemRow = GachaEventItemPayload & { key: number };

function EventForm({
  initial,
  saving,
  error,
  onCancel,
  onSubmit,
}: {
  initial?: GachaEvent;
  saving?: boolean;
  error?: string | null;
  onCancel: () => void;
  onSubmit: (payload: GachaEventPayload) => void;
}) {
  const [code, setCode] = useState(initial?.code ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [cost, setCost] = useState(String(initial?.cost ?? 10));
  const [isActive, setIsActive] = useState(initial?.is_active ?? false);
  const [items, setItems] = useState<ItemRow[]>(
    (initial?.items ?? []).map((it, i) => ({
      key: i,
      name: it.name,
      rarity: it.rarity,
      icon: it.icon,
      drop_rate: it.drop_rate,
    })),
  );

  const total = rateTotal(items);
  const totalOk = total === 100;

  const setItem = (key: number, patch: Partial<GachaEventItemPayload>) =>
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, ...patch } : it)));

  const addItem = () =>
    setItems((prev) => [
      ...prev,
      { key: Date.now(), name: "", rarity: "common", icon: "", drop_rate: 0 },
    ]);

  const removeItem = (key: number) => setItems((prev) => prev.filter((it) => it.key !== key));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          code: code.trim().toLowerCase(),
          name: name.trim(),
          description: description.trim(),
          cost: Number(cost || 0),
          is_active: isActive,
          items: items.map(({ key: _key, ...it }) => ({
            ...it,
            name: it.name.trim(),
            icon: it.icon.trim(),
            drop_rate: Number(it.drop_rate) || 0,
          })),
        });
      }}
      className="flex flex-col gap-4 rounded-xl border border-border p-5"
    >
      <h2 className="text-sm font-semibold text-foreground">
        {initial ? "Edit event" : "New event"}
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name">
          <Input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Royal Summon"
          />
        </Field>
        <Field label="Code (used by the gacha page)">
          <Input
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="gold"
            pattern="[a-z0-9-]+"
            title="Lowercase letters, digits and dashes"
          />
        </Field>
        <Field label="Cost per pull (coins)">
          <Input
            required
            type="number"
            min={1}
            value={cost}
            onChange={(e) => setCost(e.target.value)}
          />
        </Field>
        <Field label="Description">
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Premium banner…"
          />
        </Field>
      </div>

      {/* ── prize items ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-foreground">Prize items</h3>
          <span
            className={
              "rounded-full px-2 py-0.5 text-[11px] font-bold " +
              (totalOk
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-destructive/10 text-destructive")
            }
          >
            total {total.toFixed(2)}%{totalOk ? "" : " — must be 100%"}
          </span>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          <Add size={16} color="currentColor" /> Add item
        </Button>
      </div>

      {items.length === 0 && (
        <p className="text-sm text-muted-foreground">No items yet — add at least one prize.</p>
      )}

      <div className="flex flex-col gap-2">
        {items.map((it) => (
          <div
            key={it.key}
            className="grid items-end gap-2 sm:grid-cols-[1fr_140px_80px_120px_40px]"
          >
            <Field label="Item name">
              <Input
                required
                value={it.name}
                onChange={(e) => setItem(it.key, { name: e.target.value })}
              />
            </Field>
            <Field label="Rarity">
              <select
                className={
                  "h-10 rounded-lg border border-input bg-background px-3 text-sm " +
                  (RARITY_BADGES[it.rarity] ?? "")
                }
                value={it.rarity}
                onChange={(e) => setItem(it.key, { rarity: e.target.value })}
              >
                {RARITIES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Icon">
              <Input
                value={it.icon}
                onChange={(e) => setItem(it.key, { icon: e.target.value })}
                placeholder="🎁"
              />
            </Field>
            <Field label="Drop rate (%)">
              <Input
                required
                type="number"
                min={0.01}
                max={100}
                step={0.01}
                value={it.drop_rate || ""}
                onChange={(e) => setItem(it.key, { drop_rate: Number(e.target.value) })}
              />
            </Field>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeItem(it.key)}
              aria-label="Remove item"
            >
              <Trash size={16} color="currentColor" />
            </Button>
          </div>
        ))}
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 accent-primary"
        />
        Active (players can pull — requires rates totalling exactly 100%)
      </label>

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={saving || (isActive && !totalOk)}>
          {saving ? "Saving…" : "Save"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
