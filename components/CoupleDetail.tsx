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

/** 지지율 → 케미 온도 (36.5°C ~ 99.9°C) */
function chemiTemp(sharePct: number): number {
  return Math.min(99.9, Math.round((36.5 + sharePct * 1.8) * 10) / 10);
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
        <p className="text-lg font-bold text-ink">커플을 찾을 수 없어요</p>
        <Link href="/" className="mt-4 inline-block text-sm text-accent underline">
          차트로 돌아가기 →
        </Link>
      </div>
    );
  }
  if (!data) {
    return (
      <p className="py-16 text-center text-sm text-muted animate-pulse">
        케미 분석 중... 💗
      </p>
    );
  }

  const { couple, total, sharePct, daily14 } = data;
  const isMaegi = couple.m.is_maegi || couple.f.is_maegi;
  const max = Math.max(...daily14, 1);
  const week1 = daily14.slice(0, 7).reduce((a, b) => a + b, 0);
  const week2 = daily14.slice(7).reduce((a, b) => a + b, 0);
  const trendUp = week2 >= week1;
  const temp = chemiTemp(sharePct);
  const tempPct = Math.min(((temp - 36.5) / (99.9 - 36.5)) * 100, 100);

  return (
    <div>
      {/* 커플 카드 */}
      <div className="rounded-3xl bg-gradient-to-br from-accent-soft via-panel to-panel border border-line p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold tracking-wide text-muted">커플 프로필</p>
          {isMaegi && (
            <span className="rounded bg-lavender/15 px-1.5 py-0.5 text-[10px] font-bold text-lavender">
              🐟 메기 케미
            </span>
          )}
        </div>

        <div className="mt-4 flex items-start justify-center gap-3">
          <div className="w-28 text-center">
            <Badge member={couple.m} size={76} />
            <p className="mt-1.5 text-sm font-bold text-ink">
              {couple.m.name} <span className="text-xs">{couple.m.emoji}</span>
            </p>
            {couple.m.tagline && (
              <p className="mt-0.5 text-[10px] leading-tight text-muted">
                &ldquo;{couple.m.tagline}&rdquo;
              </p>
            )}
          </div>
          <span className="mt-6 text-2xl text-accent motion-safe:animate-heart-pop">💘</span>
          <div className="w-28 text-center">
            <Badge member={couple.f} size={76} />
            <p className="mt-1.5 text-sm font-bold text-ink">
              {couple.f.name} <span className="text-xs">{couple.f.emoji}</span>
            </p>
            {couple.f.tagline && (
              <p className="mt-0.5 text-[10px] leading-tight text-muted">
                &ldquo;{couple.f.tagline}&rdquo;
              </p>
            )}
          </div>
        </div>

        {/* 케미 온도 */}
        <div className="mt-5 rounded-2xl bg-panel border border-line p-4">
          <div className="flex items-baseline justify-between">
            <p className="text-xs font-bold text-muted">케미 온도</p>
            <p className="text-2xl font-extrabold tabular-nums text-accent">
              {temp.toFixed(1)}
              <span className="text-sm">°C</span>
            </p>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-accent-soft/60">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#FFB3C6] via-accent to-[#FF4D6D] transition-[width] duration-700"
              style={{ width: `${Math.max(tempPct, 3)}%` }}
            />
          </div>
          <p className="mt-1.5 text-[10px] text-muted">
            전체 하트에서 차지하는 비중이 높을수록 온도가 올라가요
          </p>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-panel border border-line py-2.5">
            <p className="text-base font-extrabold tabular-nums text-ink">
              {total.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted">받은 하트</p>
          </div>
          <div className="rounded-2xl bg-panel border border-line py-2.5">
            <p className="text-base font-extrabold tabular-nums text-ink">
              {sharePct.toFixed(1)}%
            </p>
            <p className="text-[10px] text-muted">하트 점유율</p>
          </div>
          <div className="rounded-2xl bg-panel border border-line py-2.5">
            <p className="text-base font-extrabold tabular-nums text-ink">
              {trendUp ? "🔥 상승" : "🌙 주춤"}
            </p>
            <p className="text-[10px] text-muted">이번 주 화력</p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <CheerButton coupleId={coupleId} size="lg" onCheered={load} />
        </div>
      </div>

      {/* 14일 하트 추이 */}
      <div className="mt-4 rounded-3xl bg-panel border border-line p-4 shadow-sm">
        <p className="text-xs font-bold text-muted">최근 14일 하트 추이</p>
        <div className="mt-3 flex h-20 items-end gap-1">
          {daily14.map((v, i) => (
            <div
              key={i}
              className={`flex-1 rounded-t-md ${i >= 7 ? "bg-accent/80" : "bg-accent/30"}`}
              style={{ height: `${Math.max((v / max) * 100, v > 0 ? 8 : 3)}%` }}
              title={`${v}개`}
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
