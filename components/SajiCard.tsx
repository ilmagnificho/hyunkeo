"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatKstTimestamp } from "@/lib/kst";
import { drawAvatarOnCanvas } from "@/lib/pixelart";
import { track } from "@/lib/analytics";
import type { PredictionData } from "@/lib/types";

const W = 1080;
const H = 1350;

const INK = "#43303B";
const MUTED = "#A58E99";
const PINK = "#FF5C8A";
const CREAM = "#FFF7F0";
const GOLD = "#F0A93B";

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

    // 배경: 크림 + 은은한 핑크 그라데이션
    ctx.fillStyle = CREAM;
    ctx.fillRect(0, 0, W, H);
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "rgba(255, 92, 138, 0.10)");
    grad.addColorStop(0.4, "rgba(255, 92, 138, 0)");
    grad.addColorStop(1, "rgba(183, 166, 255, 0.08)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // 프레임
    ctx.strokeStyle = "rgba(255, 92, 138, 0.35)";
    ctx.lineWidth = 4;
    roundRect(ctx, 40, 40, W - 80, H - 80, 48);
    ctx.stroke();

    const fontStack =
      '"Pretendard Variable", Pretendard, -apple-system, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif';

    // 로고
    ctx.fillStyle = PINK;
    ctx.font = `800 56px ${fontStack}`;
    ctx.textAlign = "center";
    ctx.fillText("💘 현커거래소", W / 2, 160);

    // 라운드 라벨
    ctx.fillStyle = MUTED;
    ctx.font = `600 38px ${fontStack}`;
    ctx.fillText(`ROUND ${pred.round_no} · ${pred.round_label}`, W / 2, 232);

    // 구분선 (점선 하트 느낌)
    ctx.strokeStyle = "rgba(255, 92, 138, 0.25)";
    ctx.lineWidth = 3;
    ctx.setLineDash([14, 12]);
    ctx.beginPath();
    ctx.moveTo(140, 285);
    ctx.lineTo(W - 140, 285);
    ctx.stroke();
    ctx.setLineDash([]);

    // 타이틀
    ctx.fillStyle = INK;
    ctx.font = `800 64px ${fontStack}`;
    ctx.fillText("최종커플 픽 락인", W / 2, 390);

    // 닉네임
    ctx.fillStyle = INK;
    ctx.font = `700 46px ${fontStack}`;
    ctx.fillText(`by ${pred.nickname}`, W / 2, 465);

    // 커플 목록
    const n = pred.couples.length;
    const rowH = 175;
    const startY = 565 + (3 - n) * 42;
    pred.couples.forEach((c, i) => {
      const cy = startY + i * rowH;

      // 흰색 카드
      ctx.fillStyle = "#FFFFFF";
      roundRect(ctx, 110, cy - 72, W - 220, 144, 32);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 92, 138, 0.18)";
      ctx.lineWidth = 2;
      roundRect(ctx, 110, cy - 72, W - 220, 144, 32);
      ctx.stroke();

      // 도트 아바타 (남 · 여)
      const AV = 112;
      ctx.fillStyle = `${c.m.color}26`;
      roundRect(ctx, W / 2 - 330, cy - AV / 2, AV, AV, 20);
      ctx.fill();
      drawAvatarOnCanvas(ctx, c.m, W / 2 - 330, cy - AV / 2, AV);

      ctx.fillStyle = PINK;
      ctx.font = `700 50px ${fontStack}`;
      ctx.fillText("♥", W / 2 - 163, cy + 17);

      ctx.fillStyle = `${c.f.color}26`;
      roundRect(ctx, W / 2 - 108, cy - AV / 2, AV, AV, 20);
      ctx.fill();
      drawAvatarOnCanvas(ctx, c.f, W / 2 - 108, cy - AV / 2, AV);

      // 이름
      ctx.fillStyle = INK;
      ctx.font = `700 52px ${fontStack}`;
      ctx.textAlign = "left";
      ctx.fillText(`${c.m.name} · ${c.f.name}`, W / 2 + 45, cy + 18);
      ctx.textAlign = "center";
    });

    // 타임스탬프 (성지의 핵심)
    const tsY = startY + n * rowH + 60;
    ctx.fillStyle = PINK;
    ctx.font = `800 50px ${fontStack}`;
    ctx.fillText(`${formatKstTimestamp(pred.created_at)} 락인`, W / 2, tsY);

    ctx.fillStyle = MUTED;
    ctx.font = `500 32px ${fontStack}`;
    ctx.fillText("이 타임스탬프는 수정할 수 없습니다", W / 2, tsY + 56);

    // 성지 예약 도장 (골드 스탬프)
    drawSeal(ctx, W - 210, 205, fontStack);

    // 푸터
    ctx.fillStyle = MUTED;
    ctx.font = `500 30px ${fontStack}`;
    ctx.fillText(
      "적중하면 이 카드는 성지가 됩니다 · hyunkeo.vercel.app",
      W / 2,
      H - 105
    );
  }, [pred]);

  useEffect(() => {
    if (!pred) return;
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
    showToast("이미지를 저장했어요! 📸");
    track("card_save", { prediction_id: predictionId });
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("링크를 복사했어요! 🔗");
      track("card_copy_link", { prediction_id: predictionId });
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
        <p className="text-lg font-bold text-ink">카드를 찾을 수 없어요</p>
        <Link href="/predict" className="mt-4 inline-block text-sm text-accent underline">
          픽하러 가기 →
        </Link>
      </div>
    );
  }

  if (!pred) {
    return (
      <p className="py-16 text-center text-sm text-muted animate-pulse">
        성지 카드 여는 중... 💌
      </p>
    );
  }

  return (
    <div className="pb-4">
      <p className="text-center text-sm font-bold text-ink">
        💌 락인 완료! 이 카드를 저장해 두세요
      </p>
      <p className="mt-1 text-center text-xs text-muted">
        적중하면 이 카드가 성지 인증이 됩니다
      </p>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="mt-4 w-full rounded-3xl border border-line shadow-xl"
        aria-label="성지 카드"
      />
      <div className="mt-4 flex gap-2">
        <button
          onClick={download}
          className="flex-1 rounded-2xl bg-accent py-3 text-sm font-bold text-white shadow-md shadow-accent/25 active:scale-95 transition-transform"
        >
          이미지 저장
        </button>
        <button
          onClick={copyLink}
          className="flex-1 rounded-2xl bg-panel border border-line py-3 text-sm font-bold text-ink active:scale-95 transition-transform"
        >
          링크 복사
        </button>
      </div>
      {toast && (
        <p className="mt-3 text-center text-xs font-semibold text-accent">{toast}</p>
      )}
      <Link href="/" className="mt-4 block text-center text-xs text-muted underline">
        차트로 돌아가기
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

/** 골드 "성지 예약" 스탬프 */
function drawSeal(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  fontStack: string
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.18);

  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 5;
  ctx.setLineDash([10, 8]);
  ctx.beginPath();
  ctx.arc(0, 0, 92, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = GOLD;
  ctx.font = `800 40px ${fontStack}`;
  ctx.textAlign = "center";
  ctx.fillText("성지", 0, -8);
  ctx.fillText("예약", 0, 40);
  ctx.restore();
}
