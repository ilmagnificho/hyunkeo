// 개발용 목데이터 (MOCK_DATA=1 일 때만 사용).
// 출연자 정보는 코드에 하드코딩하지 않고 supabase/seed.sql 에서 파싱한다.
import { readFileSync } from "fs";
import { join } from "path";
import type { BoardResponse, BoardRow, CastMember, CoupleInfo } from "./types";

export function isMock(): boolean {
  return process.env.MOCK_DATA === "1";
}

let cachedCast: CastMember[] | null = null;

export function mockCast(): CastMember[] {
  if (cachedCast) return cachedCast;
  const sql = readFileSync(join(process.cwd(), "supabase", "seed.sql"), "utf8");
  const re =
    /\('([mf]\d+)','\w+','([^']+)','([MF])',(true|false)\s*,'([^']+)','(#[0-9A-Fa-f]{6})'\)/g;
  const cast: CastMember[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(sql))) {
    cast.push({
      id: m[1],
      name: m[2],
      gender: m[3] as "M" | "F",
      is_maegi: m[4] === "true",
      emoji: m[5],
      color: m[6],
    });
  }
  cachedCast = cast;
  return cast;
}

export function mockCouples(): CoupleInfo[] {
  const cast = mockCast();
  const men = cast.filter((c) => c.gender === "M");
  const women = cast.filter((c) => c.gender === "F");
  const out: CoupleInfo[] = [];
  for (const m of men) for (const f of women) out.push({ id: `${m.id}-${f.id}`, m, f });
  return out;
}

function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function mockBoard(): BoardResponse {
  const couples = mockCouples();
  const rand = seededRand(42);
  const rows: BoardRow[] = couples
    .slice(0, 14)
    .map((c) => {
      const total = Math.floor(rand() * 400) + 20;
      const spark = Array.from({ length: 7 }, () => Math.floor(rand() * (total / 5)));
      return {
        coupleId: c.id,
        m: c.m,
        f: c.f,
        total,
        sharePct: 0,
        todayCount: spark[6],
        yesterdayCount: spark[5],
        deltaPp: Math.round((rand() * 9 - 4) * 10) / 10,
        spark7: spark,
      };
    });
  const sum = rows.reduce((a, r) => a + r.total, 0);
  rows.forEach((r) => (r.sharePct = Math.round((r.total / sum) * 1000) / 10));
  rows.sort((a, b) => b.total - a.total);
  return { ok: true, totalCheers: sum, rows, couples };
}
