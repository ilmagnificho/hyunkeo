"use client";

import { useEffect, useState } from "react";

// "5-6회 공개 D-2 · 46:35:11" — D-day는 KST 달력 날짜 차이(한국식), 타이머는 총 남은 시간
function kstDateOnly(t: number): number {
  // KST 기준 자정으로 정규화한 일수
  return Math.floor((t + 9 * 3600 * 1000) / 86400000);
}

export default function Countdown({
  lockAt,
  label,
}: {
  lockAt: string;
  label: string;
}) {
  const [text, setText] = useState("");

  useEffect(() => {
    const target = new Date(lockAt).getTime();
    const tick = () => {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        setText(`${label} 마감`);
        return;
      }
      const dday = kstDateOnly(target) - kstDateOnly(now);
      const totalH = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      const p = (n: number) => String(n).padStart(2, "0");
      const timer = `${p(totalH)}:${p(m)}:${p(s)}`;
      setText(dday === 0 ? `오늘 ${label} 마감! ${timer}` : `${label} D-${dday} · ${timer}`);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [lockAt, label]);

  if (!text) return <span className="text-[13px] text-muted">&nbsp;</span>;
  return (
    <span className="text-[13px] font-semibold text-muted tabular-nums whitespace-nowrap">
      {text}
    </span>
  );
}
