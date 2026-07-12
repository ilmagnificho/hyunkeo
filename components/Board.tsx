"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import Badge from "./Badge";
import Sparkline from "./Sparkline";
import CheerButton from "./CheerButton";
import type { BoardResponse, BoardRow, CoupleInfo } from "@/lib/types";

const UP = "#F04452";
const DOWN = "#3182F6";

function DeltaChip({ delta }: { delta: number }) {
  if (delta === 0) {
    return <span className="text-[11px] text-muted tabular-nums">0.0%p</span>;
  }
  const up = delta > 0;
  return (
    <span
      className="text-[11px] font-bold tabular-nums"
      style={{ color: up ? UP : DOWN }}
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

function Row({
  row,
  rank,
  flash,
  onCheered,
}: {
  row: BoardRow;
  rank: number;
  flash: "up" | "down" | null;
  onCheered: () => void;
}) {
  const isMaegi = row.m.is_maegi || row.f.is_maegi;
  return (
    <Link
      href={`/couple/${row.coupleId}`}
      className={`flex items-center gap-2.5 px-3 py-3 border-b border-white/5 hover:bg-white/[0.03] transition-colors ${
        flash === "up"
          ? "motion-safe:animate-flash-up"
          : flash === "down"
            ? "motion-safe:animate-flash-down"
            : ""
      }`}
    >
      <span className="w-6 text-center text-sm font-bold text-muted tabular-nums shrink-0">
        {rank}
      </span>
      <span className="flex -space-x-1.5 shrink-0">
        <Badge member={row.m} size={36} />
        <Badge member={row.f} size={36} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-sm font-semibold text-gray-100">
            {row.m.name} <span className="text-accent">♥</span> {row.f.name}
          </span>
          {isMaegi && <MaegiBadge />}
        </span>
        <span className="mt-0.5 flex items-center gap-2">
          <DeltaChip delta={row.deltaPp} />
          <span className="text-[11px] text-muted tabular-nums">
            오늘 {row.todayCount}
          </span>
        </span>
      </span>
      <span className="text-right shrink-0">
        <span className="block text-lg font-extrabold tabular-nums text-white leading-tight">
          {row.sharePct.toFixed(1)}%
        </span>
      </span>
      <Sparkline
        data={row.spark7}
        color={row.deltaPp > 0 ? UP : row.deltaPp < 0 ? DOWN : "#8B93A7"}
      />
      <CheerButton coupleId={row.coupleId} onCheered={onCheered} />
    </Link>
  );
}

function EmptyRow({ couple, rank }: { couple: CoupleInfo; rank: number }) {
  const isMaegi = couple.m.is_maegi || couple.f.is_maegi;
  return (
    <Link
      href={`/couple/${couple.id}`}
      className="flex items-center gap-2.5 px-3 py-3 border-b border-white/5 hover:bg-white/[0.03]"
    >
      <span className="w-6 text-center text-sm font-bold text-muted tabular-nums shrink-0">
        {rank}
      </span>
      <span className="flex -space-x-1.5 shrink-0">
        <Badge member={couple.m} size={36} />
        <Badge member={couple.f} size={36} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-sm font-semibold text-gray-100">
            {couple.m.name} <span className="text-accent">♥</span> {couple.f.name}
          </span>
          {isMaegi && <MaegiBadge />}
        </span>
      </span>
      <span className="text-lg font-extrabold tabular-nums text-muted shrink-0">0.0%</span>
      <CheerButton coupleId={couple.id} />
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

export default function Board() {
  const [data, setData] = useState<BoardResponse | null>(null);
  const [error, setError] = useState(false);
  const [flashes, setFlashes] = useState<Map<string, "up" | "down">>(new Map());
  const prevShares = useRef<Map<string, number>>(new Map());

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/board");
      if (!res.ok) throw new Error("board failed");
      const json: BoardResponse = await res.json();

      // 데이터 갱신 시 등락 방향으로 200ms 플래시
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
      if (nextFlashes.size > 0) {
        setTimeout(() => setFlashes(new Map()), 700);
      }
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

  if (error && !data) {
    return (
      <div className="py-16 text-center text-sm text-muted">
        시세판을 불러오지 못했어요. 잠시 후 새로고침 해주세요.
      </div>
    );
  }
  if (!data) {
    return (
      <div className="py-16 text-center text-sm text-muted animate-pulse">
        시세판 여는 중...
      </div>
    );
  }

  const isEmpty = data.rows.length === 0;

  return (
    <div>
      <p className="px-4 py-2 text-[11px] text-muted">
        한국 증시 관례에 따라 상승은 빨간색입니다 📈
      </p>
      {isEmpty ? (
        <>
          <p className="px-4 pb-3 text-sm text-gray-300">
            아직 개장 직후입니다. 첫 응원의 주인공이 되어보세요.
          </p>
          <div className="rounded-2xl bg-panel mx-2 overflow-hidden">
            {shuffled(data.couples ?? []).map((c, i) => (
              <EmptyRow key={c.id} couple={c} rank={i + 1} />
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-2xl bg-panel mx-2 overflow-hidden">
          {data.rows.map((row, i) => (
            <Row
              key={row.coupleId}
              row={row}
              rank={i + 1}
              flash={flashes.get(row.coupleId) ?? null}
              onCheered={load}
            />
          ))}
        </div>
      )}
      <p className="px-4 pt-3 text-[11px] text-muted tabular-nums">
        총 {data.totalCheers.toLocaleString()}개의 응원이 모였어요
      </p>
    </div>
  );
}
