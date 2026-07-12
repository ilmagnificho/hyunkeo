"use client";

// GA4 이벤트 트래킹. NEXT_PUBLIC_GA_ID 가 없으면 전부 no-op.
//
// 이벤트 설계 (핵심 퍼널):
//   cheer            하트 주기      { couple_id }
//   predict_start    픽 플로우 진입  { round_no }
//   predict_lock     픽 락인 완료    { round_no, couples_count }   ← 핵심 전환
//   card_save        카드 이미지 저장 { prediction_id }             ← 바이럴 지표
//   card_copy_link   카드 링크 복사  { prediction_id }             ← 바이럴 지표
//   comment_submit   훈수 등록      { couple_id }
//   chart_tab        차트 탭 전환    { tab }

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  window.gtag("event", event, params ?? {});
}
