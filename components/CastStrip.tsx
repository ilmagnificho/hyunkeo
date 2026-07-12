"use client";

import Link from "next/link";
import Badge from "./Badge";
import type { CoupleInfo, CastMember } from "@/lib/types";

/** 홈 상단 출연자 도감 가로 스크롤 스트립 */
export default function CastStrip({ couples }: { couples: CoupleInfo[] }) {
  if (!couples || couples.length === 0) return null;

  const seen = new Map<string, CastMember>();
  couples.forEach((c) => {
    seen.set(c.m.id, c.m);
    seen.set(c.f.id, c.f);
  });
  const cast = Array.from(seen.values());
  if (cast.length === 0) return null;

  return (
    <div className="mt-4">
      <div className="flex items-baseline justify-between px-4">
        <p className="text-sm font-extrabold text-ink">출연자 도감 👀</p>
        <Link href="/cast" className="text-[11px] font-bold text-accent">
          전체 보기 →
        </Link>
      </div>
      <div className="mt-2 flex gap-2 overflow-x-auto px-3 pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {cast.map((m) => (
          <Link
            key={m.id}
            href={`/cast#${m.id}`}
            className="w-[104px] shrink-0 rounded-2xl bg-panel border border-line p-2.5 text-center shadow-sm hover:border-accent/40 transition-colors"
          >
            <Badge member={m} size={52} />
            <p className="mt-1.5 text-xs font-bold text-ink">
              {m.name}
              {m.is_maegi && <span className="ml-0.5" title="메기">🐟</span>}
            </p>
            <p className="mt-0.5 line-clamp-2 min-h-[2em] text-[10px] leading-tight text-muted">
              {m.tagline || m.emoji}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
