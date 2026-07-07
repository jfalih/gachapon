/** The prize the server rolled. Rarity is admin-configured (common|rare|epic|legendary). */
export interface GachaReward {
  id: string;
  name: string;
  icon: string;
  rarity: string;
}

/** Body for POST v1/gacha/pull — banner is the event code (blue|gold|...). */
export interface PullGachaPayload {
  banner: string;
}

/** The roll result. `coins` is the authoritative remaining balance. */
export interface PullGachaResult {
  reward: GachaReward;
  cost: number;
  coins: number;
}
