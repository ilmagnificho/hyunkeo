"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Countdown from "./Countdown";
import type { RoundResponse } from "@/lib/types";

export default function TopBar() {
  const [round, setRound] = useState<RoundResponse | null>(null);

  useEffect(() => {
    fetch("/api/round")
      .then((r) => r.json())
      .then(setRound)
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-board/90 backdrop-blur">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-2 px-4 py-3">
        <div className="min-w-0">
          <Link href="/" className="flex items-center gap-1.5 text-base font-extrabold tracking-tight text-white">
            <span className="text-accent">♥</span>현커거래소
            <span className="rounded bg-up/15 px-1 py-px text-[9px] font-bold text-up tracking-wider">
              LIVE
            </span>
          </Link>
          <div className="mt-0.5">
            {round && !round.closed && round.round ? (
              <Countdown lockAt={round.round.lock_at} label={round.round.label.replace(" 공개 전", " 공개")} />
            ) : round?.closed ? (
              <span className="text-xs text-muted">전 라운드 마감</span>
            ) : (
              <span className="text-xs text-muted">&nbsp;</span>
            )}
          </div>
        </div>
        <Link
          href="/predict"
          className="shrink-0 rounded-xl bg-accent px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-accent/25 active:scale-95 transition-transform"
        >
          최종커플 예측 락인하기 →
        </Link>
      </div>
    </header>
  );
}
