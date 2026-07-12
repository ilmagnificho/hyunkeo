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
  size?: "sm" | "lg" | "icon";
}) {
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pop, setPop] = useState(false);
  const [floatOne, setFloatOne] = useState(false);
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
          setPop(true);
          setFloatOne(true);
          setTimeout(() => setPop(false), 400);
          setTimeout(() => setFloatOne(false), 950);
          setToast("하트 전달 완료! 내일 또 줄 수 있어요");
          onCheered?.();
        }
      } else if (json.reason === "rate_limited") {
        setToast("오늘 하트를 다 썼어요! 내일 만나요");
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
      ? "px-6 py-2.5 text-sm rounded-full"
      : size === "icon"
        ? "h-9 w-9 rounded-full text-base leading-none flex items-center justify-center"
        : "px-2.5 py-1.5 text-xs rounded-full";
  const label =
    size === "icon" ? (done ? "🩷" : "🤍") : done ? "오늘의 하트 완료 🩷" : "🤍 하트 주기";

  return (
    <span className="relative inline-flex flex-col items-center">
      {floatOne && (
        <span className="pointer-events-none absolute -top-1 text-sm font-extrabold text-accent motion-safe:animate-float-up">
          +1 💖
        </span>
      )}
      <button
        onClick={cheer}
        disabled={done || busy}
        className={`${base} font-bold transition-colors ${
          pop ? "motion-safe:animate-heart-pop" : ""
        } ${
          done
            ? "bg-accent-soft/70 text-accent cursor-default"
            : "bg-accent text-white shadow-md shadow-accent/25 hover:brightness-105 active:scale-95"
        }`}
        aria-label={done ? "오늘 하트 완료" : "하트 주기"}
      >
        {label}
      </button>
      {toast && (
        <span className="absolute -top-8 whitespace-nowrap rounded-lg bg-ink px-2 py-1 text-[11px] text-white shadow-lg z-10">
          {toast}
        </span>
      )}
    </span>
  );
}
