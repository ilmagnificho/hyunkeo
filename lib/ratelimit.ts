import { createHash } from "crypto";
import { kstDateString } from "./kst";

// IP 해시 기반 인메모리 레이트리밋 (서버리스 인스턴스별 — v1 수준에서 허용).
// device_id 기준 제한은 DB count 로 별도 검증한다.

const counters = new Map<string, { day: string; count: number }>();

export function hashIp(ip: string): string {
  const salt = process.env.RATE_LIMIT_SALT ?? "hyunkeo-v1";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 16);
}

export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/** KST 하루 기준 카운터 증가. limit 초과 시 false. */
export function bumpIpCounter(scope: string, ip: string, limit: number): boolean {
  const key = `${scope}:${hashIp(ip)}`;
  const today = kstDateString();
  const cur = counters.get(key);
  if (!cur || cur.day !== today) {
    counters.set(key, { day: today, count: 1 });
    return true;
  }
  if (cur.count >= limit) return false;
  cur.count += 1;
  return true;
}
