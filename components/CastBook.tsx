"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Badge from "./Badge";
import type { BoardResponse, CastMember } from "@/lib/types";

interface BestChemi {
  coupleId: string;
  partnerName: string;
  total: number;
}

export default function CastBook() {
  const [data, setData] = useState<BoardResponse | null>(null);

  useEffect(() => {
    fetch("/api/board")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  const { cast, bestOf } = useMemo(() => {
    const seen = new Map<string, CastMember>();
    (data?.couples ?? []).forEach((c) => {
      seen.set(c.m.id, c.m);
      seen.set(c.f.id, c.f);
    });
    // 각 출연자의 현재 최고 케미 (하트 1개 이상인 커플 중 최다)
    const best = new Map<string, BestChemi>();
    (data?.rows ?? []).forEach((r) => {
      for (const [me, partner] of [
        [r.m, r.f],
        [r.f, r.m],
      ] as const) {
        const cur = best.get(me.id);
        if (!cur || r.total > cur.total) {
          best.set(me.id, {
            coupleId: r.coupleId,
            partnerName: partner.name,
            total: r.total,
          });
        }
      }
    });
    return { cast: Array.from(seen.values()), bestOf: best };
  }, [data]);

  if (!data) {
    return (
      <p className="py-16 text-center text-sm text-muted animate-pulse">
        도감 펼치는 중... 📖
      </p>
    );
  }

  const men = cast.filter((c) => c.gender === "M");
  const women = cast.filter((c) => c.gender === "F");

  return (
    <div className="pb-4">
      {[
        ["남자 출연자", men],
        ["여자 출연자", women],
      ].map(([label, group]) => (
        <section key={label as string} className="mt-5">
          <h2 className="text-sm font-extrabold text-ink">{label as string}</h2>
          <div className="mt-2 space-y-2.5">
            {(group as CastMember[]).map((m) => {
              const best = bestOf.get(m.id);
              return (
                <article
                  key={m.id}
                  id={m.id}
                  className="scroll-mt-24 rounded-3xl bg-panel border border-line p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <Badge member={m} size={64} />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 text-base font-extrabold text-ink">
                        {m.name} <span className="text-sm">{m.emoji}</span>
                        {m.is_maegi && (
                          <span className="rounded bg-lavender/20 px-1.5 py-0.5 text-[10px] font-bold text-lavender">
                            🐟 메기
                          </span>
                        )}
                      </p>
                      {m.tagline && (
                        <p className="mt-0.5 text-xs font-bold text-accent">
                          &ldquo;{m.tagline}&rdquo;
                        </p>
                      )}
                      {m.bio && (
                        <p className="mt-1.5 text-xs leading-relaxed text-ink/70">{m.bio}</p>
                      )}
                    </div>
                  </div>
                  {best && (
                    <Link
                      href={`/couple/${best.coupleId}`}
                      className="mt-3 flex items-center justify-between rounded-2xl bg-accent-soft/50 px-3 py-2 text-xs"
                    >
                      <span className="font-bold text-ink/80">
                        현재 최고 케미 · {m.name}
                        <span className="text-accent">♥</span>
                        {best.partnerName}
                      </span>
                      <span className="font-extrabold text-accent tabular-nums">
                        {best.total.toLocaleString()}💖 →
                      </span>
                    </Link>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      ))}
      <p className="mt-6 text-center text-[10px] leading-relaxed text-muted">
        캐릭터 소개는 방송 컨셉을 바탕으로 한 팬 시점 관전 포인트이며
        실제 인물의 정보가 아닙니다.
      </p>
    </div>
  );
}
