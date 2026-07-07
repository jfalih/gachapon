// Rarity presentation helpers. The banners themselves (items, drop rates,
// costs) are admin-configured and fetched from the backend (GET v1/events) —
// nothing about the prize pool is hardcoded on the client.

export const RARITY_ORDER = ["legendary", "epic", "rare", "common"] as const;

export const RARITY_COLORS: Record<string, string> = {
  common: "#9aa4b2",
  rare: "#4a9eff",
  epic: "#b36bff",
  legendary: "#ffc247",
};

export const RARITY_LABELS: Record<string, string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};

/** Color for a backend rarity label, tolerating unknown values. */
export const rarityColor = (rarity: string): string =>
  RARITY_COLORS[rarity] ?? RARITY_COLORS.common;

/** Display label for a backend rarity, tolerating unknown values. */
export const rarityLabel = (rarity: string): string => RARITY_LABELS[rarity] ?? rarity;
