"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useCallback, useMemo, useRef, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";

import type { GachaEvent } from "@/core/api/events";
import type { GachaReward } from "@/core/api/gacha";
import type { Profile } from "@/core/api/profile";
import { ROUTES } from "@/core/route";
import { useGachaEventsQuery } from "@/services/hooks/apis/events";
import { usePullGacha } from "@/services/hooks/apis/gacha";
import { useMyHistoryQuery } from "@/services/hooks/apis/history";
import { profileKeys, useMeQuery } from "@/services/hooks/apis/profile";

import { useCurrentUser } from "../current-user";
import { RARITY_ORDER, rarityColor, rarityLabel } from "../rewards";
import styles from "../gacha.module.css";
import { ClawMachineCanvas, type ClawMachineHandle } from "./claw-machine-canvas";

const SPARKLES: { top: string; left: string; delay: string; size: string }[] = [
  { top: "4%", left: "12%", delay: "0s", size: "16px" },
  { top: "16%", left: "84%", delay: "0.4s", size: "12px" },
  { top: "68%", left: "4%", delay: "0.8s", size: "13px" },
  { top: "82%", left: "78%", delay: "1.1s", size: "17px" },
  { top: "40%", left: "94%", delay: "0.6s", size: "10px" },
];

export function GachaPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { user, status: authStatus } = useCurrentUser();
  const machineRef = useRef<ClawMachineHandle>(null);
  const [pulling, setPulling] = useState(false);
  const [result, setResult] = useState<GachaReward | null>(null);
  const [showRewards, setShowRewards] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [histOffset, setHistOffset] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [shakeCoins, setShakeCoins] = useState(false);

  // Banners (items, drop rates, costs) are admin-configured — always fetched
  // from the backend, never hardcoded.
  const { data: events } = useGachaEventsQuery();
  const banners = useMemo(() => events ?? [], [events]);

  // Coins are the server's balance: guests see 0, players see GET /me.
  const { data: me } = useMeQuery(authStatus === "authenticated");
  const coins = authStatus === "authenticated" ? (me?.coins ?? 0) : 0;

  // Pull history — only fetched while the modal is open (players only).
  const HIST_LIMIT = 10;
  const { data: history, isFetching: historyFetching } = useMyHistoryQuery(
    { limit: HIST_LIMIT, offset: histOffset },
    authStatus === "authenticated" && showHistory,
  );

  const showToast = useCallback((msg: string) => {
    setToast(null);
    requestAnimationFrame(() => setToast(msg));
  }, []);

  const shake = useCallback(() => {
    setShakeCoins(true);
    setTimeout(() => setShakeCoins(false), 450);
  }, []);

  const pullGacha = usePullGacha();

  const pull = (banner: GachaEvent) => {
    if (pulling) return;
    // Pulling costs real coins — guests must sign in first.
    if (authStatus !== "authenticated") {
      showToast("Sign in to summon!");
      router.push(ROUTES.AUTH.LOGIN);
      return;
    }
    if (coins < banner.cost) {
      showToast("Not enough coins!");
      shake();
      return;
    }
    setPulling(true);
    // The server rolls the banner, deducts atomically, and returns the balance.
    pullGacha.mutate(
      { banner: banner.code },
      {
        onSuccess: ({ reward, coins: remaining }) => {
          qc.setQueryData(profileKeys.me.queryKey, (prev: Profile | null | undefined) =>
            prev ? { ...prev, coins: remaining } : prev,
          );
          machineRef.current?.pull(rarityColor(reward.rarity), () => {
            setResult(reward);
            setPulling(false);
          });
        },
        onError: (err) => {
          setPulling(false);
          // Re-sync the balance in case the server rejected for coins.
          qc.invalidateQueries({ queryKey: profileKeys.me.queryKey });
          showToast((err as { message?: string })?.message ?? "Summon failed — try again!");
          shake();
        },
      },
    );
  };

  return (
    <div className={styles.root}>
      <ClawMachineCanvas ref={machineRef} />
      <div className={styles.vignette} />

      {/* ---- top bar ---- */}
      <header className={styles.topbar}>
        {authStatus === "unauthenticated" ? (
          <div className={styles.authGroup}>
            <Link href={ROUTES.AUTH.LOGIN} className={`${styles.panel} ${styles.authBtn}`}>
              LOGIN
            </Link>
            <Link
              href={ROUTES.AUTH.REGISTER}
              className={`${styles.panel} ${styles.authBtn} ${styles.authBtnGold}`}
            >
              REGISTER
            </Link>
          </div>
        ) : (
          <div className={styles.leftGroup}>
            <div className={styles.userMenuWrap}>
              <button
                type="button"
                className={`${styles.panel} ${styles.userPanel}`}
                onClick={() => setShowUserMenu((v) => !v)}
              >
                <span className={styles.userAvatar}>{user?.avatar ?? "…"}</span>
                <span className={styles.userInfo}>
                  <span className={styles.userName}>{user?.name ?? "Loading…"}</span>
                  <span className={styles.userLevel}>
                    {user ? `Lv. ${user.level} · ${user.title}` : ""}
                  </span>
                </span>
                <span className={styles.userCaret}>▾</span>
              </button>
              {showUserMenu && (
                <>
                  <div
                    className={styles.menuBackdrop}
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className={`${styles.panel} ${styles.userMenu}`}>
                    <button
                      type="button"
                      className={styles.userMenuItem}
                      onClick={() => {
                        setShowUserMenu(false);
                        setHistOffset(0);
                        setShowHistory(true);
                      }}
                    >
                      ⌛ History
                    </button>
                    <Link href={ROUTES.ACCOUNT} className={styles.userMenuItem}>
                      ⚙ Settings
                    </Link>
                    <button
                      type="button"
                      className={`${styles.userMenuItem} ${styles.userMenuDanger}`}
                      onClick={() => signOut({ callbackUrl: ROUTES.HOME })}
                    >
                      ⏻ Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        <div className={styles.topRight}>
          {authStatus === "authenticated" && (
            <div
              className={`${styles.panel} ${styles.coinPanel} ${shakeCoins ? styles.coinShake : ""}`}
            >
              <span className={styles.coinIcon}>🪙</span>
              <span className={styles.coinValue}>{coins.toLocaleString()}</span>
            </div>
          )}
          <button
            type="button"
            className={`${styles.panel} ${styles.rewardsBtn}`}
            onClick={() => setShowRewards(true)}
          >
            ⟡ REWARDS
          </button>
        </div>
      </header>

      {toast && (
        <div key={toast + Math.random()} className={`${styles.panel} ${styles.toast}`}>
          {toast}
        </div>
      )}

      {/* ---- gacha buttons (one per active backend event) ---- */}
      <div className={styles.actions}>
        {banners.map((banner, idx) => (
          <button
            key={banner.id}
            type="button"
            className={`${styles.gachaBtn} ${isGoldBanner(banner, idx) ? styles.btnGold : styles.btnBlue}`}
            disabled={pulling}
            onClick={() => pull(banner)}
          >
            {banner.name}
            <span className={styles.btnCost}>🪙 {banner.cost}</span>
          </button>
        ))}
      </div>

      {/* ---- rewards list modal ---- */}
      {showRewards && (
        <div className={styles.overlay} onClick={() => setShowRewards(false)}>
          <div className={`${styles.panel} ${styles.modal}`} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>REWARD LIST</h2>
            <div className={styles.modalDivider} />
            {banners.map((banner, idx) => {
              const gold = isGoldBanner(banner, idx);
              return (
                <section key={banner.id} className={styles.bannerSection}>
                  <div className={styles.bannerHeader}>
                    <span
                      className={`${styles.bannerName} ${
                        gold ? styles.bannerNameGold : styles.bannerNameBlue
                      }`}
                    >
                      {gold ? "❖" : "◈"} {banner.name}
                    </span>
                    <span className={styles.bannerCost}>🪙 {banner.cost} / pull</span>
                  </div>
                  {rarityGroups(banner).map(({ rarity, rate, items }) => (
                    <div key={rarity} className={styles.rarityRow}>
                      <div className={styles.rarityLabel} style={{ color: rarityColor(rarity) }}>
                        {rarityLabel(rarity)}
                        <span className={styles.rarityRate}>{formatRate(rate)}%</span>
                      </div>
                      <div className={styles.itemChips}>
                        {items.map((item) => (
                          <span
                            key={item.id}
                            className={styles.chip}
                            style={{ borderColor: rarityColor(item.rarity) }}
                          >
                            <span>{item.icon}</span>
                            {item.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </section>
              );
            })}
            <button
              type="button"
              className={`${styles.panel} ${styles.closeBtn}`}
              onClick={() => setShowRewards(false)}
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* ---- pull history modal ---- */}
      {showHistory && (
        <div className={styles.overlay} onClick={() => setShowHistory(false)}>
          <div className={`${styles.panel} ${styles.modal}`} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>SUMMON HISTORY</h2>
            <div className={styles.modalDivider} />
            {history && history.items.length === 0 && (
              <p className={styles.modalEmpty}>No summons yet — try your luck!</p>
            )}
            <div className={styles.historyList}>
              {history?.items.map((entry) => (
                <div key={entry.id} className={styles.historyRow}>
                  <div className={styles.historyMain}>
                    <span
                      className={styles.historyItem}
                      style={{ color: rarityColor(entry.item_rarity) }}
                    >
                      {entry.item_name}
                    </span>
                    <span className={styles.historyEvent}>{entry.event_name}</span>
                  </div>
                  <div className={styles.historySide}>
                    <span className={styles.historyCost}>-{entry.cost} 🪙</span>
                    <span className={styles.historyDate}>
                      {new Date(entry.created_at).toLocaleString(undefined, {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {history && history.total > HIST_LIMIT && (
              <div className={styles.historyNav}>
                <button
                  type="button"
                  className={`${styles.panel} ${styles.historyNavBtn}`}
                  disabled={histOffset === 0 || historyFetching}
                  onClick={() => setHistOffset(Math.max(0, histOffset - HIST_LIMIT))}
                >
                  ‹ PREV
                </button>
                <span className={styles.historyPage}>
                  {histOffset + 1}–{Math.min(histOffset + HIST_LIMIT, history.total)} of{" "}
                  {history.total}
                </span>
                <button
                  type="button"
                  className={`${styles.panel} ${styles.historyNavBtn}`}
                  disabled={histOffset + HIST_LIMIT >= history.total || historyFetching}
                  onClick={() => setHistOffset(histOffset + HIST_LIMIT)}
                >
                  NEXT ›
                </button>
              </div>
            )}
            <button
              type="button"
              className={`${styles.panel} ${styles.closeBtn}`}
              onClick={() => setShowHistory(false)}
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* ---- pull result modal ---- */}
      {result && (
        <div className={styles.overlay}>
          <div
            className={`${styles.panel} ${styles.result}`}
            style={{ "--glow": rarityColor(result.rarity) } as React.CSSProperties}
          >
            <div className={styles.resultRarity}>{rarityLabel(result.rarity)}</div>
            <div className={styles.resultRays}>
              {SPARKLES.map((s, i) => (
                <span
                  key={i}
                  className={styles.sparkle}
                  style={{
                    top: s.top,
                    left: s.left,
                    fontSize: s.size,
                    animationDelay: s.delay,
                  }}
                >
                  ✦
                </span>
              ))}
              <span className={styles.resultIcon}>{result.icon}</span>
            </div>
            <div className={styles.resultName}>{result.name}</div>
            <div className={styles.resultSub}>has been added to your inventory</div>
            <button type="button" className={styles.takeBtn} onClick={() => setResult(null)}>
              TAKE REWARD
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Gold styling for the premium banner; falls back to alternating by index. */
const isGoldBanner = (banner: GachaEvent, idx: number) =>
  banner.code === "gold" || (banner.code !== "blue" && idx % 2 === 1);

/** Group a banner's items by rarity (rarest first) with the combined rate. */
const rarityGroups = (banner: GachaEvent) => {
  const items = banner.items ?? [];
  const known = RARITY_ORDER.filter((r) => items.some((it) => it.rarity === r));
  const extras = [...new Set(items.map((it) => it.rarity))].filter(
    (r) => !(RARITY_ORDER as readonly string[]).includes(r),
  );
  return [...known, ...extras].map((rarity) => {
    const pool = items.filter((it) => it.rarity === rarity);
    return {
      rarity,
      rate: pool.reduce((acc, it) => acc + it.drop_rate, 0),
      items: pool,
    };
  });
};

/** Trim trailing zeros: 60 → "60", 0.5 → "0.5". */
const formatRate = (rate: number) => Number(rate.toFixed(2)).toString();
