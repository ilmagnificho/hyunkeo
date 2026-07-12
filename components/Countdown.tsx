"use client";

import { useEffect, useState } from "react";

// "5-6회 공개까지 D-2 04:12:33" 형태의 라이브 카운트다운
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
      const diff = target - Date.now();
      if (diff <= 0) {
        setText(`${label} 마감`);
        return;
      }
      const days = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      const p = (n: number) => String(n).padStart(2, "0");
      setText(`${label}까지 D-${days} ${p(h)}:${p(m)}:${p(s)}`);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [lockAt, label]);

  if (!text) return <span className="text-xs text-muted">&nbsp;</span>;
  return (
    <span className="text-xs font-semibold text-muted tabular-nums whitespace-nowrap">
      {text}
    </span>
  );
}
