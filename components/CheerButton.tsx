"use client";

import { useEffect, useState } from "react";
import { getDeviceId, hasCheeredToday, markCheeredToday } from "@/lib/device";

export default function CheerButton({
  coupleId,
  onCheered,
  size = "sm",
}: {
  coupleId: string;
  onCheered?: () => void;
  size?: "sm" | "lg";
}) {
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    setDone(hasCheeredToday(coupleId));
  }, [coupleId]);

  async function cheer(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (done || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/cheer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coupleId, deviceId: getDeviceId() }),
      });
      const json = await res.json();
      if (json.ok || json.reason === "already") {
        markCheeredToday(coupleId);
        setDone(true);
        if (json.ok) {
          setToast("응원 완료! 내일 또 가능해요");
          onCheered?.();
        }
      } else if (json.reason === "rate_limited") {
        setToast("오늘 응원 한도에 도달했어요");
      } else {
        setToast("잠시 후 다시 시도해주세요");
      }
    } catch {
      setToast("잠시 후 다시 시도해주세요");
    } finally {
      setBusy(false);
      setTimeout(() => setToast(""), 2500);
    }
  }

  const base =
    size === "lg"
      ? "px-5 py-2.5 text-sm rounded-xl"
      : "px-2.5 py-1.5 text-xs rounded-lg";

  return (
    <span className="relative inline-flex flex-col items-center">
      <button
        onClick={cheer}
        disabled={done || busy}
        className={`${base} font-semibold transition-colors ${
          done
            ? "bg-panel-2 text-muted cursor-default"
            : "bg-accent/15 text-accent hover:bg-accent/25 active:scale-95"
        }`}
        aria-label={done ? "오늘 응원 완료" : "응원하기"}
      >
        {done ? "내일 또 응원" : "❤️ +1"}
      </button>
      {toast && (
        <span className="absolute -top-8 whitespace-nowrap rounded-md bg-panel-2 px-2 py-1 text-[11px] text-gray-200 shadow-lg z-10">
          {toast}
        </span>
      )}
    </span>
  );
}
