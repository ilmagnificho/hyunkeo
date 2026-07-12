"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Badge from "./Badge";
import CheerButton from "./CheerButton";
import CommentSection from "./CommentSection";
import type { CoupleInfo } from "@/lib/types";

interface CoupleData {
  couple: CoupleInfo;
  total: number;
  sharePct: number;
  daily14: number[];
}

export default function CoupleDetail({ coupleId }: { coupleId: string }) {
  const [data, setData] = useState<CoupleData | null>(null);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(() => {
    fetch(`/api/couple/${coupleId}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.ok) setData(json);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true));
  }, [coupleId]);

  useEffect(() => {
    load();
  }, [load]);

  if (notFound) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg font-bold text-white">종목을 찾을 수 없어요</p>
        <Link href="/" className="mt-4 inline-block text-sm text-accent underline">
          시세판으로 →
        </Link>
      </div>
    );
  }
  if (!data) {
    return (
      <p className="py-16 text-center text-sm text-muted animate-pulse">종목 정보 조회 중...</p>
    );
  }

  const { couple, total, sharePct, daily14 } = data;
  const isMaegi = couple.m.is_maegi || couple.f.is_maegi;
  const max = Math.max(...daily14, 1);
  const week1 = daily14.slice(0, 7).reduce((a, b) => a + b, 0);
  const week2 = daily14.slice(7).reduce((a, b) => a + b, 0);
  const trend = week2 - week1;

  return (
    <div>
      {/* 종목 헤더 */}
      <div className="rounded-2xl bg-gradient-to-br from-panel-2 to-panel border border-white/5 p-5">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[11px] tracking-widest text-muted uppercase">
            KRX-LOVE · {couple.id}
          </p>
          {isMaegi && (
            <span className="rounded bg-amber-400/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
              🐟 메기 관련주
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-center gap-3">
          <div className="text-center">
            <Badge member={couple.m} size={72} />
            <p className="mt-1.5 text-sm font-bold text-gray-100">
              {couple.m.name} <span className="text-xs">{couple.m.emoji}</span>
            </p>
          </div>
          <span className="text-2xl text-accent">♥</span>
          <div className="text-center">
            <Badge member={couple.f} size={72} />
            <p className="mt-1.5 text-sm font-bold text-gray-100">
              {couple.f.name} <span className="text-xs">{couple.f.emoji}</span>
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-black/20 py-2.5">
            <p className="text-lg font-extrabold tabular-nums text-white">{sharePct.toFixed(1)}%</p>
            <p className="text-[10px] text-muted">지지율</p>
          </div>
          <div className="rounded-xl bg-black/20 py-2.5">
            <p className="text-lg font-extrabold tabular-nums text-white">
              {total.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted">총 응원</p>
          </div>
          <div className="rounded-xl bg-black/20 py-2.5">
            <p
              className="text-lg font-extrabold tabular-nums"
              style={{ color: trend >= 0 ? "#F04452" : "#3182F6" }}
            >
              {trend >= 0 ? "▲" : "▼"}{Math.abs(trend)}
            </p>
            <p className="text-[10px] text-muted">주간 모멘텀</p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <CheerButton coupleId={coupleId} size="lg" onCheered={load} />
        </div>
      </div>

      {/* 14일 바 차트 */}
      <div className="mt-4 rounded-2xl bg-panel border border-white/5 p-4">
        <p className="text-xs font-bold text-muted">최근 14일 응원 추이</p>
        <div className="mt-3 flex h-20 items-end gap-1">
          {daily14.map((v, i) => (
            <div
              key={i}
              className={`flex-1 rounded-t ${i >= 7 ? "bg-accent/70" : "bg-accent/30"}`}
              style={{ height: `${Math.max((v / max) * 100, v > 0 ? 8 : 2)}%` }}
              title={`${v}회`}
            />
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-muted">
          <span>2주 전</span>
          <span>오늘</span>
        </div>
      </div>

      {/* 한 줄 훈수 */}
      <CommentSection coupleId={coupleId} />
    </div>
  );
}
