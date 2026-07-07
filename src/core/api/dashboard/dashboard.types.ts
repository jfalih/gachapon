import type { GachaHistoryEntry } from "@/core/api/history";

export type DashboardTotals = {
  players: number;
  events: number;
  active_events: number;
  pulls: number;
  coins_spent: number;
  coins_in_circulation: number;
};

export type DashboardToday = {
  pulls: number;
  coins_spent: number;
  new_players: number;
};

export type RarityCount = { rarity: string; count: number };

export type TopItem = { item_name: string; item_rarity: string; count: number };

export type TopSpender = {
  user_id: number;
  email: string;
  full_name: string;
  pulls: number;
  coins_spent: number;
};

/** GET v1/admin/dashboard — system-wide aggregates for the admin home. */
export type DashboardStats = {
  totals: DashboardTotals;
  today: DashboardToday;
  rarity_breakdown: RarityCount[];
  top_items: TopItem[];
  top_spenders: TopSpender[];
  recent_pulls: GachaHistoryEntry[];
};
