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
    <header className="sticky top-0 z-20 border-b border-line bg-board/90 backdrop-blur">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-2 px-4 py-3">
        <div className="min-w-0">
          <Link
            href="/"
            className="flex items-center gap-1 text-base font-extrabold tracking-tight text-ink"
          >
            <span className="text-accent">💘</span>현커거래소
          </Link>
          <div className="mt-0.5">
            {round && !round.closed && round.round ? (
              <Countdown
                lockAt={round.round.lock_at}
                label={round.round.label.replace(" 공개 전", " 공개")}
              />
            ) : round?.closed ? (
              <span className="text-xs text-muted">모든 픽 마감</span>
            ) : (
              <span className="text-xs text-muted">&nbsp;</span>
            )}
          </div>
        </div>
        <Link
          href="/predict"
          className="shrink-0 rounded-full bg-gradient-to-r from-accent to-[#FF8FAB] px-4 py-2 text-xs font-bold text-white shadow-lg shadow-accent/25 active:scale-95 transition-transform"
        >
          최종커플 픽 락인 💌
        </Link>
      </div>
    </header>
  );
}
