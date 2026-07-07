/** One gacha pull. Names are snapshots taken at pull time; the user fields are
 * only present on the admin view. */
export type GachaHistoryEntry = {
  id: number;
  user_id: number;
  event_id: number | null;
  item_id: number | null;
  event_name: string;
  item_name: string;
  item_rarity: string;
  cost: number;
  created_at: string;
  user_email?: string;
  user_full_name?: string;
};

/** Server-paginated page of pulls. */
export type GachaHistoryPage = {
  items: GachaHistoryEntry[];
  total: number;
  limit: number;
  offset: number;
};

export type HistoryParams = {
  limit?: number;
  offset?: number;
};
