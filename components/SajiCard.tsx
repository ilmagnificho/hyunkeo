"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatKstTimestamp } from "@/lib/kst";
import type { PredictionData } from "@/lib/types";

const W = 1080;
const H = 1350;

export default function SajiCard({ predictionId }: { predictionId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pred, setPred] = useState<PredictionData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetch(`/api/prediction/${predictionId}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.ok) setPred(json.prediction);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true));
  }, [predictionId]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !pred) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 배경: 다크 거래소 보드
    ctx.fillStyle = "#0F1522";
    ctx.fillRect(0, 0, W, H);

    // 미묘한 그라데이션
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "rgba(255, 92, 122, 0.08)");
    grad.addColorStop(0.35, "rgba(255, 92, 122, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // 테두리 프레임
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 40, W - 80, H - 80);

    const fontStack =
      '"Pretendard Variable", Pretendard, -apple-system, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif';

    // 로고
    ctx.fillStyle = "#FF5C7A";
    ctx.font = `800 56px ${fontStack}`;
    ctx.textAlign = "center";
    ctx.fillText("현커거래소", W / 2, 160);

    // 라운드 라벨
    ctx.fillStyle = "#8B93A7";
    ctx.font = `600 40px ${fontStack}`;
    ctx.fillText(`ROUND ${pred.round_no} · ${pred.round_label}`, W / 2, 235);

    // 구분선
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.beginPath();
    ctx.moveTo(120, 290);
    ctx.lineTo(W - 120, 290);
    ctx.stroke();

    // 타이틀
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `800 64px ${fontStack}`;
    ctx.fillText("최종커플 예측 락인", W / 2, 390);

    // 닉네임
    ctx.fillStyle = "#E5E9F2";
    ctx.font = `700 48px ${fontStack}`;
    ctx.fillText(`by ${pred.nickname}`, W / 2, 470);

    // 커플 목록 (배지 쌍 + 이름)
    const n = pred.couples.length;
    const rowH = 170;
    const startY = 560 + (3 - n) * 40;
    pred.couples.forEach((c, i) => {
      const cy = startY + i * rowH;

      // 카드 배경
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      roundRect(ctx, 120, cy - 70, W - 240, 140, 28);
      ctx.fill();

      // 남자 배지
      drawBadge(ctx, W / 2 - 250, cy, 55, c.m.color, c.m.name.charAt(0), c.m.emoji, fontStack);
      // 하트
      ctx.fillStyle = "#FF5C7A";
      ctx.font = `700 52px ${fontStack}`;
      ctx.fillText("♥", W / 2 - 130, cy + 18);
      // 여자 배지
      drawBadge(ctx, W / 2 - 30, cy, 55, c.f.color, c.f.name.charAt(0), c.f.emoji, fontStack);

      // 이름
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `700 54px ${fontStack}`;
      ctx.textAlign = "left";
      ctx.fillText(`${c.m.name} · ${c.f.name}`, W / 2 + 70, cy + 20);
      ctx.textAlign = "center";
    });

    // 타임스탬프 (성지의 핵심)
    const tsY = startY + n * rowH + 70;
    ctx.fillStyle = "#FF5C7A";
    ctx.font = `800 52px ${fontStack}`;
    ctx.fillText(`${formatKstTimestamp(pred.created_at)} 락인`, W / 2, tsY);

    ctx.fillStyle = "#8B93A7";
    ctx.font = `500 34px ${fontStack}`;
    ctx.fillText("이 타임스탬프는 수정할 수 없습니다", W / 2, tsY + 60);

    // 푸터
    ctx.fillStyle = "#8B93A7";
    ctx.font = `500 32px ${fontStack}`;
    ctx.fillText("종영 후 적중 시 이 카드는 성지가 됩니다 · hyunkeo.vercel.app", W / 2, H - 110);
  }, [pred]);

  useEffect(() => {
    if (!pred) return;
    // 폰트 로드 후 다시 그려 글꼴 적용 보장
    draw();
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(() => draw());
    }
  }, [pred, draw]);

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = `hyunkeo-card-${predictionId.slice(0, 8)}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
    showToast("이미지를 저장했어요!");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("링크를 복사했어요!");
    } catch {
      showToast("복사에 실패했어요");
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  }

  if (notFound) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg font-bold text-white">카드를 찾을 수 없어요</p>
        <Link href="/predict" className="mt-4 inline-block text-sm text-accent underline">
          예측하러 가기 →
        </Link>
      </div>
    );
  }

  if (!pred) {
    return (
      <p className="py-16 text-center text-sm text-muted animate-pulse">
        성지 카드 여는 중...
      </p>
    );
  }

  return (
    <div className="pb-4">
      <p className="text-center text-sm font-bold text-gray-100">
        🔒 락인 완료! 이 카드를 저장해 두세요
      </p>
      <p className="mt-1 text-center text-xs text-muted">
        종영 후 적중하면 이 카드가 성지 인증이 됩니다
      </p>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="mt-4 w-full rounded-2xl shadow-2xl"
        aria-label="성지 카드"
      />
      <div className="mt-4 flex gap-2">
        <button
          onClick={download}
          className="flex-1 rounded-xl bg-accent py-3 text-sm font-bold text-white active:scale-95 transition-transform"
        >
          이미지 저장
        </button>
        <button
          onClick={copyLink}
          className="flex-1 rounded-xl bg-white/10 py-3 text-sm font-bold text-gray-100 active:scale-95 transition-transform"
        >
          링크 복사
        </button>
      </div>
      {toast && (
        <p className="mt-3 text-center text-xs font-semibold text-accent">{toast}</p>
      )}
      <Link href="/" className="mt-4 block text-center text-xs text-muted underline">
        시세판으로 돌아가기
      </Link>
    </div>
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawBadge(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
  initial: string,
  emoji: string,
  fontStack: string
) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  ctx.fillStyle = "#0F1522";
  ctx.font = `800 ${r * 0.85}px ${fontStack}`;
  ctx.textAlign = "center";
  ctx.fillText(initial, cx, cy + r * 0.3);

  ctx.font = `${r * 0.6}px ${fontStack}`;
  ctx.fillText(emoji, cx + r * 0.75, cy + r * 0.85);
}
