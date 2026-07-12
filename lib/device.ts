"use client";

// 기기 식별: UUID v4 를 localStorage 에 보관. 로그인 없음.

const DEVICE_KEY = "hyunkeo_device_id";
const NICKNAME_KEY = "hyunkeo_nickname";

export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

export function getSavedNickname(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(NICKNAME_KEY) ?? "";
}

export function saveNickname(nickname: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(NICKNAME_KEY, nickname);
}

/** 오늘(KST) 이 커플을 이미 응원했는지 - 클라이언트 UX용 (서버도 별도 검증) */
export function kstToday(): string {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

export function hasCheeredToday(coupleId: string): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(`hyunkeo_cheer_${coupleId}`) === kstToday();
}

export function markCheeredToday(coupleId: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`hyunkeo_cheer_${coupleId}`, kstToday());
}

export function hasReported(commentId: string): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(`hyunkeo_report_${commentId}`) === "1";
}

export function markReported(commentId: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`hyunkeo_report_${commentId}`, "1");
}
