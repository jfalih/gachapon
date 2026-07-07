"use client";

import { Input } from "@/components/atoms/input";
import { Skeleton } from "@/components/atoms/skeleton";
import { useMeQuery } from "@/services/hooks/apis/profile";

/** Read-only profile card — the gacha backend exposes no profile editing. */
export function ProfileSettingsForm() {
  const { data: me, isLoading, isError } = useMeQuery();

  if (isLoading) return <Skeleton className="h-72 w-full max-w-lg rounded-xl" />;
  if (isError || !me)
    return <p className="text-sm text-destructive">Could not load your profile.</p>;

  return (
    <div className="flex max-w-lg flex-col gap-4">
      <Field label="Email">
        <Input value={me.email ?? ""} disabled />
      </Field>
      <Field label="Full name">
        <Input value={me.full_name ?? ""} disabled />
      </Field>
      <Field label="Role">
        <Input value={me.role} disabled className="capitalize" />
      </Field>
      <Field label="Coins">
        <Input value={`🪙 ${(me.coins ?? 0).toLocaleString()}`} disabled />
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}
