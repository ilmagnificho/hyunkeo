// KST(Asia/Seoul) 날짜/시간 유틸. 서버는 UTC로 돌 수 있으므로 항상 이 유틸을 통해 계산한다.

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** 주어진 시각의 KST 날짜 문자열 (YYYY-MM-DD) */
export function kstDateString(d: Date = new Date()): string {
  const kst = new Date(d.getTime() + KST_OFFSET_MS);
  return kst.toISOString().slice(0, 10);
}

/** KST 기준 n일 전 날짜 문자열 */
export function kstDateStringDaysAgo(days: number, from: Date = new Date()): string {
  return kstDateString(new Date(from.getTime() - days * 24 * 60 * 60 * 1000));
}

/** 최근 n일 KST 날짜 배열 (과거 → 오늘 순) */
export function kstLastNDates(n: number, from: Date = new Date()): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    out.push(kstDateStringDaysAgo(i, from));
  }
  return out;
}

/** KST 기준 오늘 00:00:00 의 UTC ISO 문자열 (created_at 범위 조회용) */
export function kstDayStartUtcIso(d: Date = new Date()): string {
  const dateStr = kstDateString(d);
  return new Date(`${dateStr}T00:00:00+09:00`).toISOString();
}

/** 카드용 정밀 타임스탬프: "2026.07.12 23:41:07 KST" */
export function formatKstTimestamp(iso: string): string {
  const d = new Date(iso);
  const kst = new Date(d.getTime() + KST_OFFSET_MS);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${kst.getUTCFullYear()}.${p(kst.getUTCMonth() + 1)}.${p(kst.getUTCDate())} ${p(
    kst.getUTCHours()
  )}:${p(kst.getUTCMinutes())}:${p(kst.getUTCSeconds())} KST`;
}
