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
        <p className="text-lg font-bold text-white">커플을 찾을 수 없어요</p>
        <Link href="/" className="mt-4 inline-block text-sm text-accent underline">
          시세판으로 →
        </Link>
      </div>
    );
  }
  if (!data) {
    return (
      <p className="py-16 text-center text-sm text-muted animate-pulse">불러오는 중...</p>
    );
  }

  const { couple, total, sharePct, daily14 } = data;
  const isMaegi = couple.m.is_maegi || couple.f.is_maegi;
  const max = Math.max(...daily14, 1);

  return (
    <div>
      {/* 헤더 */}
      <div className="rounded-2xl bg-panel p-5 text-center">
        <div className="flex items-center justify-center -space-x-2">
          <Badge member={couple.m} size={56} />
          <Badge member={couple.f} size={56} />
        </div>
        <p className="mt-3 text-lg font-extrabold text-white">
          {couple.m.name} <span className="text-accent">♥</span> {couple.f.name}
          {isMaegi && (
            <span className="ml-2 align-middle rounded bg-amber-400/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
              메기
            </span>
          )}
        </p>
        <div className="mt-4 flex justify-center gap-8">
          <div>
            <p className="text-2xl font-extrabold tabular-nums text-white">
              {sharePct.toFixed(1)}%
            </p>
            <p className="text-[11px] text-muted">지지율</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold tabular-nums text-white">
              {total.toLocaleString()}
            </p>
            <p className="text-[11px] text-muted">총 응원</p>
          </div>
        </div>
        <div className="mt-4">
          <CheerButton coupleId={coupleId} size="lg" onCheered={load} />
        </div>
      </div>

      {/* 14일 바 차트 */}
      <div className="mt-4 rounded-2xl bg-panel p-4">
        <p className="text-xs font-bold text-muted">최근 14일 응원 추이</p>
        <div className="mt-3 flex h-20 items-end gap-1">
          {daily14.map((v, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-accent/60"
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
