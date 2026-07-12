"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Badge from "./Badge";
import Sparkline from "./Sparkline";
import CheerButton from "./CheerButton";
import type { BoardResponse, BoardRow, CoupleInfo } from "@/lib/types";

const UP = "#F04452";
const DOWN = "#3182F6";

type Tab = "all" | "hot" | "maegi";

/* ---------- 현커지수 헤더 ---------- */

function IndexHeader({ data }: { data: BoardResponse }) {
  const todayTotal = data.rows.reduce((a, r) => a + r.todayCount, 0);
  const yesterdayTotal = data.rows.reduce((a, r) => a + r.yesterdayCount, 0);
  const diff = todayTotal - yesterdayTotal;
  const up = diff >= 0;

  return (
    <div className="mx-2 rounded-2xl bg-gradient-to-br from-panel-2 to-panel p-4 border border-white/5">
      <div className="flex items-center justify-between">
        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-muted">
            현커지수 <span className="text-accent">HYUNKEO INDEX</span>
          </p>
          <p className="mt-1 text-3xl font-extrabold tabular-nums text-white leading-none">
            {data.totalCheers.toLocaleString()}
            <span className="ml-1 text-sm font-bold text-muted">♥</span>
          </p>
        </div>
        <div className="text-right">
          <p className="flex items-center justify-end gap-1 text-[11px] font-bold text-muted">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-up animate-blink-dot" />
            실시간 거래중
          </p>
          <p
            className="mt-1 text-sm font-extrabold tabular-nums"
            style={{ color: up ? UP : DOWN }}
          >
            오늘 {up ? "▲" : "▼"} {Math.abs(diff).toLocaleString()}
          </p>
          <p className="text-[10px] text-muted tabular-nums">전일 응원 대비</p>
        </div>
      </div>
    </div>
  );
}

/* ---------- 시황 한 줄 ---------- */

function marketComment(data: BoardResponse): string {
  if (data.rows.length === 0) return "장 개시. 첫 응원을 기다리는 중입니다.";
  const top = data.rows[0];
  const hottest = [...data.rows].sort((a, b) => b.deltaPp - a.deltaPp)[0];
  const coldest = [...data.rows].sort((a, b) => a.deltaPp - b.deltaPp)[0];
  if (hottest.deltaPp >= 3)
    return `📢 ${hottest.m.name}♥${hottest.f.name} 급등세! 시장이 요동치고 있습니다`;
  if (hottest.m.is_maegi || hottest.f.is_maegi)
    return `📢 메기 라인 강세. ${hottest.m.name}♥${hottest.f.name} 매수세 유입 중`;
  if (coldest.deltaPp <= -3)
    return `📢 ${coldest.m.name}♥${coldest.f.name} 조정 국면. 저가 매수 기회?`;
  return `📢 ${top.m.name}♥${top.f.name} 대장주 수성 중. 시장은 대체로 안정적`;
}

/* ---------- 티커 테이프 ---------- */

function TickerTape({ rows }: { rows: BoardRow[] }) {
  if (rows.length < 2) return null;
  const items = rows.slice(0, 10);
  const strip = (
    <>
      {items.map((r) => (
        <span key={r.coupleId} className="mx-3 inline-flex items-center gap-1 text-[11px] tabular-nums">
          <span className="font-bold text-gray-200">
            {r.m.name}♥{r.f.name}
          </span>
          <span className="text-muted">{r.sharePct.toFixed(1)}%</span>
          <span style={{ color: r.deltaPp >= 0 ? UP : DOWN }} className="font-bold">
            {r.deltaPp >= 0 ? "▲" : "▼"}
            {Math.abs(r.deltaPp).toFixed(1)}
          </span>
        </span>
      ))}
    </>
  );
  return (
    <div className="mt-2 overflow-hidden border-y border-white/5 bg-black/20 py-1.5">
      <div className="flex w-max whitespace-nowrap motion-safe:animate-marquee motion-reduce:overflow-x-auto">
        {strip}
        {strip}
      </div>
    </div>
  );
}

/* ---------- 등락 칩 ---------- */

function DeltaChip({ delta }: { delta: number }) {
  if (delta === 0) {
    return (
      <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[11px] font-bold text-muted tabular-nums">
        ― 0.0%p
      </span>
    );
  }
  const up = delta > 0;
  return (
    <span
      className="rounded-md px-1.5 py-0.5 text-[11px] font-extrabold tabular-nums"
      style={{
        color: up ? UP : DOWN,
        backgroundColor: up ? "rgba(240,68,82,0.12)" : "rgba(49,130,246,0.12)",
      }}
    >
      {up ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%p
    </span>
  );
}

function MaegiBadge() {
  return (
    <span className="rounded bg-amber-400/15 px-1 py-0.5 text-[10px] font-bold text-amber-300">
      메기
    </span>
  );
}

const RANK_STYLE: Record<number, string> = {
  1: "text-amber-300",
  2: "text-gray-300",
  3: "text-orange-300/90",
};

/* ---------- 종목 행 ---------- */

function Row({
  row,
  rank,
  flash,
  isTopGainer,
  onCheered,
}: {
  row: BoardRow;
  rank: number;
  flash: "up" | "down" | null;
  isTopGainer: boolean;
  onCheered: () => void;
}) {
  const isMaegi = row.m.is_maegi || row.f.is_maegi;
  return (
    <Link
      href={`/couple/${row.coupleId}`}
      className={`flex items-center gap-2 px-2.5 py-3 border-b border-white/5 hover:bg-white/[0.03] transition-colors ${
        flash === "up"
          ? "motion-safe:animate-flash-up"
          : flash === "down"
            ? "motion-safe:animate-flash-down"
            : ""
      }`}
    >
      <span
        className={`w-5 text-center text-base font-extrabold tabular-nums shrink-0 ${
          RANK_STYLE[rank] ?? "text-muted"
        }`}
      >
        {rank}
      </span>
      <span className="flex gap-0.5 shrink-0">
        <Badge member={row.m} size={36} />
        <Badge member={row.f} size={36} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-bold text-gray-100">
          {row.m.name}
          <span className="mx-0.5 text-accent">♥</span>
          {row.f.name}
          {isTopGainer && <span className="ml-1 text-xs">🔥</span>}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-1">
          <DeltaChip delta={row.deltaPp} />
          {isMaegi && <MaegiBadge />}
          <span className="text-[11px] text-muted tabular-nums">+{row.todayCount}</span>
        </span>
      </span>
      <span className="text-right shrink-0">
        <span className="block text-xl font-extrabold tabular-nums text-white leading-tight">
          {row.sharePct.toFixed(1)}
          <span className="text-xs font-bold text-muted">%</span>
        </span>
        <Sparkline
          data={row.spark7}
          width={52}
          height={16}
          color={row.deltaPp > 0 ? UP : row.deltaPp < 0 ? DOWN : "#8B93A7"}
        />
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
      className="flex items-center gap-2 px-2.5 py-3 border-b border-white/5 hover:bg-white/[0.03]"
    >
      <span className="w-5 text-center text-base font-extrabold text-muted tabular-nums shrink-0">
        {rank}
      </span>
      <span className="flex gap-0.5 shrink-0">
        <Badge member={couple.m} size={36} />
        <Badge member={couple.f} size={36} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-bold text-gray-100">
          {couple.m.name}
          <span className="mx-0.5 text-accent">♥</span>
          {couple.f.name}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-1">
          {isMaegi && <MaegiBadge />}
          <span className="text-[11px] text-muted">상장 대기 · 첫 응원 모집 중</span>
        </span>
      </span>
      <span className="text-xl font-extrabold tabular-nums text-muted shrink-0">
        0.0<span className="text-xs">%</span>
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

/* ---------- 메인 보드 ---------- */

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
          if (prev !== undefined && prev !== row.sharePct) {
            nextFlashes.set(row.coupleId, row.sharePct > prev ? "up" : "down");
          }
        }
      }
      prevShares.current = new Map(json.rows.map((r) => [r.coupleId, r.sharePct]));
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

  const topGainerId = useMemo(() => {
    if (!data || data.rows.length < 2) return null;
    const hottest = [...data.rows].sort((a, b) => b.deltaPp - a.deltaPp)[0];
    return hottest.deltaPp > 0 ? hottest.coupleId : null;
  }, [data]);

  const visibleRows = useMemo(() => {
    if (!data) return [];
    if (tab === "hot")
      return [...data.rows].filter((r) => r.deltaPp > 0).sort((a, b) => b.deltaPp - a.deltaPp);
    if (tab === "maegi") return data.rows.filter((r) => r.m.is_maegi || r.f.is_maegi);
    return data.rows;
  }, [data, tab]);

  if (error && !data) {
    return (
      <div className="py-16 text-center text-sm text-muted">
        시세판을 불러오지 못했어요. 잠시 후 새로고침 해주세요.
      </div>
    );
  }
  if (!data) {
    return (
      <div className="py-16 text-center text-sm text-muted animate-pulse">시세판 여는 중...</div>
    );
  }

  const isEmpty = data.rows.length === 0;

  return (
    <div>
      <IndexHeader data={data} />
      <TickerTape rows={data.rows} />

      <p className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-300">{marketComment(data)}</p>
      <p className="px-4 pb-2 text-[10px] text-muted">
        한국 증시 관례에 따라 상승은 <span className="text-up font-bold">빨간색</span>입니다 📈
      </p>

      {isEmpty ? (
        <>
          <p className="px-4 pb-3 text-sm text-gray-300">
            아직 개장 직후입니다. 첫 응원의 주인공이 되어보세요.
          </p>
          <div className="mx-2 overflow-hidden rounded-2xl bg-panel border border-white/5">
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
                ["all", "전체"],
                ["hot", "🔥 급상승"],
                ["maegi", "🐟 메기장"],
              ] as [Tab, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                  tab === key ? "bg-accent text-white" : "bg-panel text-muted hover:text-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mx-2 overflow-hidden rounded-2xl bg-panel border border-white/5">
            {visibleRows.map((row) => (
              <Row
                key={row.coupleId}
                row={row}
                rank={data.rows.indexOf(row) + 1}
                flash={flashes.get(row.coupleId) ?? null}
                isTopGainer={row.coupleId === topGainerId}
                onCheered={load}
              />
            ))}
            {visibleRows.length === 0 && (
              <p className="py-10 text-center text-xs text-muted">해당하는 종목이 없어요</p>
            )}
          </div>
        </>
      )}
      <p className="px-4 pt-3 text-[11px] text-muted tabular-nums">
        총 {data.totalCheers.toLocaleString()}개의 응원이 모였어요 · 1분마다 자동 갱신
      </p>
    </div>
  );
}
