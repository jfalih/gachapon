/** A prize inside a gacha event. drop_rate is a percent (0–100], 2 decimals. */
export type GachaEventItem = {
  id: number;
  event_id: number;
  name: string;
  rarity: string; // common|rare|epic|legendary
  icon: string; // emoji
  drop_rate: number;
  created_at: string;
  updated_at: string;
};

/** A gacha banner: prize pool + pull cost, addressed by a stable code. */
export type GachaEvent = {
  id: number;
  code: string;
  name: string;
  description: string;
  cost: number; // coins per pull
  is_active: boolean;
  items?: GachaEventItem[];
  created_at: string;
  updated_at: string;
};

/** Item row for POST/PUT /admin/events — ids are managed by the backend. */
export type GachaEventItemPayload = {
  name: string;
  rarity: string;
  icon: string;
  drop_rate: number;
};

/** Body for POST/PUT /admin/events. Rates must total 100% when is_active. */
export type GachaEventPayload = {
  code: string;
  name: string;
  description: string;
  cost: number;
  is_active: boolean;
  items: GachaEventItemPayload[];
};
