import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { kstDateString, kstDateStringDaysAgo, kstLastNDates } from "@/lib/kst";
import type { BoardResponse, BoardRow, CastMember, CoupleInfo } from "@/lib/types";

export const dynamic = "force-dynamic";

// 60초 인메모리 캐시
let cache: { at: number; data: BoardResponse } | null = null;
const CACHE_MS = 60 * 1000;

interface CoupleRowDb {
  id: string;
  m_id: string;
  f_id: string;
}

export async function GET() {
  if (process.env.MOCK_DATA === "1") {
    const { mockBoard } = await import("@/lib/mock");
    return NextResponse.json(mockBoard());
  }
  try {
    if (cache && Date.now() - cache.at < CACHE_MS) {
      return NextResponse.json(cache.data);
    }

    const sb = getServiceClient();

    const [{ data: castRows, error: castErr }, { data: coupleRows, error: coupleErr }] =
      await Promise.all([
        sb.from("cast_members").select("id,name,gender,is_maegi,emoji,color"),
        sb.from("couples").select("id,m_id,f_id"),
      ]);
    if (castErr || coupleErr || !castRows || !coupleRows) {
      throw castErr ?? coupleErr ?? new Error("data load failed");
    }

    const castById = new Map<string, CastMember>(
      castRows.map((c) => [c.id, c as CastMember])
    );
    const coupleInfo = (c: CoupleRowDb): CoupleInfo => ({
      id: c.id,
      m: castById.get(c.m_id)!,
      f: castById.get(c.f_id)!,
    });

    // 전체 응원 이력 (couple_id, cheered_on) — v1 스케일에서 JS 집계로 충분
    const cheers: { couple_id: string; cheered_on: string }[] = [];
    const PAGE = 1000;
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await sb
        .from("cheers")
        .select("couple_id,cheered_on")
        .range(from, from + PAGE - 1);
      if (error) throw error;
      if (!data || data.length === 0) break;
      cheers.push(...data);
      if (data.length < PAGE) break;
    }

    const today = kstDateString();
    const yesterday = kstDateStringDaysAgo(1);
    const last7 = kstLastNDates(7);
    const last7Idx = new Map(last7.map((d, i) => [d, i]));

    const totalAll = cheers.length;

    // 커플별 집계
    const agg = new Map<
      string,
      { total: number; today: number; yesterday: number; upToYesterday: number; spark: number[] }
    >();
    for (const ch of cheers) {
      let a = agg.get(ch.couple_id);
      if (!a) {
        a = { total: 0, today: 0, yesterday: 0, upToYesterday: 0, spark: new Array(7).fill(0) };
        agg.set(ch.couple_id, a);
      }
      a.total += 1;
      if (ch.cheered_on === today) a.today += 1;
      else a.upToYesterday += 1; // 어제까지의 누적
      if (ch.cheered_on === yesterday) a.yesterday += 1;
      const idx = last7Idx.get(ch.cheered_on);
      if (idx !== undefined) a.spark[idx] += 1;
    }

    const totalUpToYesterday = cheers.filter((c) => c.cheered_on !== today).length;

    const rows: BoardRow[] = [];
    for (const c of coupleRows as CoupleRowDb[]) {
      const a = agg.get(c.id);
      if (!a || a.total === 0) continue;
      const sharePct = totalAll > 0 ? (a.total / totalAll) * 100 : 0;
      const yesterdaySharePct =
        totalUpToYesterday > 0 ? (a.upToYesterday / totalUpToYesterday) * 100 : 0;
      const info = coupleInfo(c);
      rows.push({
        coupleId: c.id,
        m: info.m,
        f: info.f,
        total: a.total,
        sharePct: Math.round(sharePct * 10) / 10,
        todayCount: a.today,
        yesterdayCount: a.yesterday,
        deltaPp: Math.round((sharePct - yesterdaySharePct) * 10) / 10,
        spark7: a.spark,
      });
    }
    rows.sort((x, y) => y.total - x.total || x.coupleId.localeCompare(y.coupleId));

    const data: BoardResponse = {
      ok: true,
      totalCheers: totalAll,
      rows,
      // 빈 상태 렌더링용 전체 커플 목록 (항상 포함 — 커플 상세에서도 사용)
      couples: (coupleRows as CoupleRowDb[]).map(coupleInfo),
    };

    cache = { at: Date.now(), data };
    return NextResponse.json(data);
  } catch (e) {
    console.error("/api/board", e);
    return NextResponse.json(
      { ok: false, totalCheers: 0, rows: [] } satisfies BoardResponse,
      { status: 500 }
    );
  }
}
