"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Badge from "./Badge";
import CastStrip from "./CastStrip";
import CheerButton from "./CheerButton";
import type { BoardResponse, BoardRow, CoupleInfo } from "@/lib/types";
import { track } from "@/lib/analytics";

type Tab = "all" | "hot" | "maegi";

/* ---------- 오늘의 하트 히어로 ---------- */

function HeartHero({ data }: { data: BoardResponse }) {
  const todayTotal = data.rows.reduce((a, r) => a + r.todayCount, 0);
  return (
    <div className="mx-2 rounded-3xl bg-gradient-to-br from-accent-soft via-panel-2 to-panel p-5 border border-line shadow-sm">
      <p className="text-xs font-bold tracking-wide text-muted">
        오늘 모인 하트
      </p>
      <p className="mt-1 flex items-baseline gap-1.5">
        <span className="text-4xl font-extrabold tabular-nums text-ink leading-none">
          {todayTotal.toLocaleString()}
        </span>
        <span className="text-xl">💖</span>
      </p>
      <p className="mt-2 text-xs text-muted tabular-nums">
        누적 {data.totalCheers.toLocaleString()} 하트 · 하트는 매일 자정 리셋!
        오늘도 최애 커플에게 💌
      </p>
    </div>
  );
}

/* ---------- 케미 속보 ---------- */

function chemiNews(data: BoardResponse): string {
  if (data.rows.length === 0) return "📢 차트 오픈! 첫 하트의 주인공을 기다리고 있어요";
  const top = data.rows[0];
  const hottest = [...data.rows].sort(
    (a, b) => (b.rankChange ?? 99) - (a.rankChange ?? 99)
  )[0];
  const newcomer = data.rows.find((r) => r.rankChange === null);
  if (hottest.rankChange !== null && hottest.rankChange >= 2)
    return `📢 ${hottest.m.name}♥${hottest.f.name}, 밤사이 ${hottest.rankChange}계단 급상승! 무슨 일이야 💘`;
  if (newcomer)
    return `📢 ${newcomer.m.name}♥${newcomer.f.name} 차트 신규 진입! 새 케미 감지 👀`;
  if (top.m.is_maegi || top.f.is_maegi)
    return `📢 메기 라인이 1위라니… ${top.m.name}♥${top.f.name} 대세 인정 🐟`;
  return `📢 ${top.m.name}♥${top.f.name}, 오늘도 1위 수성 중! 팬심 굳건 💪`;
}

/* ---------- 하트 티커 ---------- */

function TickerTape({ rows }: { rows: BoardRow[] }) {
  if (rows.length < 2) return null;
  const items = rows.slice(0, 10);
  const strip = (
    <>
      {items.map((r, i) => (
        <span
          key={r.coupleId}
          className="mx-3 inline-flex items-center gap-1 text-xs tabular-nums"
        >
          <span className="font-bold text-accent">{i + 1}위</span>
          <span className="font-bold text-ink">
            {r.m.name}♥{r.f.name}
          </span>
          <span className="text-muted">{r.total.toLocaleString()}💖</span>
        </span>
      ))}
    </>
  );
  return (
    <div className="mt-3 overflow-hidden border-y border-line bg-panel py-1.5">
      <div className="flex w-max whitespace-nowrap motion-safe:animate-marquee">
        {strip}
        {strip}
      </div>
    </div>
  );
}

/* ---------- 순위 변동 칩 (음원차트 스타일) ---------- */

function RankChip({ change }: { change: number | null }) {
  if (change === null) {
    return (
      <span className="rounded bg-accent-soft px-1 py-px text-[10px] font-extrabold text-accent">
        NEW
      </span>
    );
  }
  if (change === 0) {
    return <span className="text-[11px] font-bold text-muted">―</span>;
  }
  const up = change > 0;
  return (
    <span
      className="text-[11px] font-extrabold tabular-nums"
      style={{ color: up ? "#FF4D6D" : "#7BA6E8" }}
    >
      {up ? "▲" : "▼"}
      {Math.abs(change)}
    </span>
  );
}

function MaegiBadge() {
  return (
    <span className="rounded bg-lavender/15 px-1 py-0.5 text-[11px] font-bold text-lavender">
      🐟 메기
    </span>
  );
}

const RANK_STYLE: Record<number, string> = {
  1: "text-gold",
  2: "text-[#B9AEB6]",
  3: "text-[#D69A6E]",
};

/* ---------- 차트 행 ---------- */

function Row({
  row,
  rank,
  maxTotal,
  flash,
  isHot,
  onCheered,
}: {
  row: BoardRow;
  rank: number;
  maxTotal: number;
  flash: "up" | "down" | null;
  isHot: boolean;
  onCheered: () => void;
}) {
  const isMaegi = row.m.is_maegi || row.f.is_maegi;
  const barPct = Math.max((row.total / maxTotal) * 100, 4);
  return (
    <Link
      href={`/couple/${row.coupleId}`}
      className={`flex items-center gap-2 px-3 py-3 border-b border-line last:border-b-0 hover:bg-accent-soft/30 transition-colors ${
        flash === "up"
          ? "motion-safe:animate-flash-up"
          : flash === "down"
            ? "motion-safe:animate-flash-down"
            : ""
      }`}
    >
      <span className="flex w-7 flex-col items-center shrink-0">
        <span
          className={`text-lg font-extrabold tabular-nums leading-none ${
            RANK_STYLE[rank] ?? "text-muted"
          }`}
        >
          {rank}
        </span>
        <span className="mt-0.5">
          <RankChip change={row.rankChange} />
        </span>
      </span>
      <span className="flex gap-0.5 shrink-0">
        <Badge member={row.m} size={40} />
        <Badge member={row.f} size={40} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1">
          <span className="truncate text-base font-bold text-ink">
            {row.m.name}
            <span className="mx-0.5 text-accent">♥</span>
            {row.f.name}
          </span>
          {isHot && <span className="text-xs">🔥</span>}
          {isMaegi && <MaegiBadge />}
        </span>
        {/* 화력 게이지 */}
        <span className="mt-1.5 block h-2 w-full overflow-hidden rounded-full bg-accent-soft/60">
          <span
            className="block h-full rounded-full bg-gradient-to-r from-accent to-[#FF8FAB] transition-[width] duration-500"
            style={{ width: `${barPct}%` }}
          />
        </span>
        <span className="mt-1 flex items-center gap-2 text-xs text-muted tabular-nums">
          <span className="font-bold text-ink/70">{row.total.toLocaleString()}💖</span>
          <span>오늘 +{row.todayCount}</span>
        </span>
      </span>
      <CheerButton coupleId={row.coupleId} size="icon" onCheered={onCheered} />
    </Link>
  );
}

function EmptyRow({ couple, rank }: { couple: CoupleInfo; rank: number }) {
  const isMaegi = couple.m.is_maegi || couple.f.is_maegi;
  return (
    <Link
      href={`/couple/${couple.id}`}
      className="flex items-center gap-2 px-3 py-3 border-b border-line last:border-b-0 hover:bg-accent-soft/30"
    >
      <span className="w-7 text-center text-lg font-extrabold text-muted/50 tabular-nums shrink-0">
        {rank}
      </span>
      <span className="flex gap-0.5 shrink-0">
        <Badge member={couple.m} size={40} />
        <Badge member={couple.f} size={40} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1">
          <span className="truncate text-base font-bold text-ink">
            {couple.m.name}
            <span className="mx-0.5 text-accent">♥</span>
            {couple.f.name}
          </span>
          {isMaegi && <MaegiBadge />}
        </span>
        <span className="mt-1 block text-xs text-muted">
          아직 하트 0개 · 첫 하트를 기다려요
        </span>
      </span>
      <CheerButton coupleId={couple.id} size="icon" />
    </Link>
  );
}

/** 시드 고정 셔플 (하루 단위로 동일 순서 유지) */
function shuffled<T>(arr: T[]): T[] {
  const day = Math.floor(Date.now() / 86400000);
  const out = [...arr];
  let seed = day;
  for (let i = out.length - 1; i > 0; i--) {
    seed = (seed * 9301 + 49297) % 233280;
    const j = Math.floor((seed / 233280) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/* ---------- 메인 차트 ---------- */

export default function Board() {
  const [data, setData] = useState<BoardResponse | null>(null);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<Tab>("all");
  const [flashes, setFlashes] = useState<Map<string, "up" | "down">>(new Map());
  const prevShares = useRef<Map<string, number>>(new Map());

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/board");
      if (!res.ok) throw new Error("board failed");
      const json: BoardResponse = await res.json();

      const nextFlashes = new Map<string, "up" | "down">();
      if (prevShares.current.size > 0) {
        for (const row of json.rows) {
          const prev = prevShares.current.get(row.coupleId);
          if (prev !== undefined && prev !== row.total) {
            nextFlashes.set(row.coupleId, row.total > prev ? "up" : "down");
          }
        }
      }
      prevShares.current = new Map(json.rows.map((r) => [r.coupleId, r.total]));
      setFlashes(nextFlashes);
      if (nextFlashes.size > 0) setTimeout(() => setFlashes(new Map()), 700);
      setData(json);
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [load]);

  const hotId = useMemo(() => {
    if (!data || data.rows.length < 2) return null;
    const jumps = data.rows.filter((r) => (r.rankChange ?? 0) > 0);
    if (jumps.length === 0) return null;
    return jumps.sort((a, b) => (b.rankChange ?? 0) - (a.rankChange ?? 0))[0].coupleId;
  }, [data]);

  const visibleRows = useMemo(() => {
    if (!data) return [];
    if (tab === "hot")
      return [...data.rows]
        .filter((r) => r.rankChange === null || r.rankChange > 0 || r.deltaPp > 0)
        .sort((a, b) => (b.rankChange ?? 9) - (a.rankChange ?? 9));
    if (tab === "maegi") return data.rows.filter((r) => r.m.is_maegi || r.f.is_maegi);
    return data.rows;
  }, [data, tab]);

  if (error && !data) {
    return (
      <div className="py-16 text-center text-sm text-muted">
        차트를 불러오지 못했어요. 잠시 후 새로고침 해주세요.
      </div>
    );
  }
  if (!data) {
    return (
      <div className="py-16 text-center text-sm text-muted animate-pulse">
        차트 여는 중... 💗
      </div>
    );
  }

  const isEmpty = data.rows.length === 0;
  const maxTotal = isEmpty ? 1 : Math.max(...data.rows.map((r) => r.total));

  return (
    <div>
      <HeartHero data={data} />
      <CastStrip couples={data.couples ?? []} />
      <TickerTape rows={data.rows} />

      <p className="px-4 pt-3 pb-2 text-xs font-bold text-ink/80">{chemiNews(data)}</p>

      {isEmpty ? (
        <>
          <p className="px-4 pb-3 text-sm text-ink/70">
            차트가 방금 열렸어요! 첫 하트의 주인공이 되어주세요 💖
          </p>
          <div className="mx-2 overflow-hidden rounded-3xl bg-panel border border-line shadow-sm">
            {shuffled(data.couples ?? []).map((c, i) => (
              <EmptyRow key={c.id} couple={c} rank={i + 1} />
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="mx-2 mb-2 flex gap-1.5">
            {(
              [
                ["all", "실시간 차트"],
                ["hot", "🔥 떡상 중"],
                ["maegi", "🐟 메기 라인"],
              ] as [Tab, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => {
                  setTab(key);
                  track("chart_tab", { tab: key });
                }}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                  tab === key
                    ? "bg-accent text-white shadow-sm"
                    : "bg-panel text-muted border border-line hover:text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mx-2 overflow-hidden rounded-3xl bg-panel border border-line shadow-sm">
            {visibleRows.map((row) => (
              <Row
                key={row.coupleId}
                row={row}
                rank={data.rows.indexOf(row) + 1}
                maxTotal={maxTotal}
                flash={flashes.get(row.coupleId) ?? null}
                isHot={row.coupleId === hotId}
                onCheered={load}
              />
            ))}
            {visibleRows.length === 0 && (
              <p className="py-10 text-center text-xs text-muted">해당하는 커플이 없어요</p>
            )}
          </div>
        </>
      )}
      <p className="px-4 pt-3 text-xs text-muted tabular-nums">
        순위는 누적 하트 기준 · 1분마다 자동 갱신 · 기기당 커플별 하루 1하트
      </p>
    </div>
  );
}
