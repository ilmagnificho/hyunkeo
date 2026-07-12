import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { kstLastNDates } from "@/lib/kst";
import type { CastMember } from "@/lib/types";

export const dynamic = "force-dynamic";

// 커플 상세: 배지 정보 + 총 응원 + 지지율 + 최근 14일 일별 카운트
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (process.env.MOCK_DATA === "1") {
    const { mockCouples } = await import("@/lib/mock");
    const c = mockCouples().find((x) => x.id === id);
    if (!c) return NextResponse.json({ ok: false, reason: "not_found" }, { status: 404 });
    return NextResponse.json({
      ok: true,
      couple: c,
      total: 312,
      sharePct: 12.4,
      daily14: [3, 8, 12, 9, 20, 31, 28, 35, 22, 41, 38, 29, 24, 12],
      dates14: [],
    });
  }
  try {
    const sb = getServiceClient();

    const { data: couple, error: coupleErr } = await sb
      .from("couples")
      .select("id,m_id,f_id")
      .eq("id", id)
      .maybeSingle();
    if (coupleErr) throw coupleErr;
    if (!couple) {
      return NextResponse.json({ ok: false, reason: "not_found" }, { status: 404 });
    }

    const [{ data: castRows }, { count: total }, { count: totalAll }, { data: recent }] =
      await Promise.all([
        sb
          .from("cast_members")
          .select("id,name,gender,is_maegi,emoji,color")
          .in("id", [couple.m_id, couple.f_id]),
        sb.from("cheers").select("id", { count: "exact", head: true }).eq("couple_id", id),
        sb.from("cheers").select("id", { count: "exact", head: true }),
        sb
          .from("cheers")
          .select("cheered_on")
          .eq("couple_id", id)
          .gte("cheered_on", kstLastNDates(14)[0])
          .limit(10000),
      ]);

    const castById = new Map<string, CastMember>(
      (castRows ?? []).map((c) => [c.id, c as CastMember])
    );

    const last14 = kstLastNDates(14);
    const idx = new Map(last14.map((d, i) => [d, i]));
    const daily = new Array(14).fill(0);
    for (const r of recent ?? []) {
      const i = idx.get(r.cheered_on);
      if (i !== undefined) daily[i] += 1;
    }

    return NextResponse.json({
      ok: true,
      couple: {
        id: couple.id,
        m: castById.get(couple.m_id),
        f: castById.get(couple.f_id),
      },
      total: total ?? 0,
      sharePct:
        (totalAll ?? 0) > 0 ? Math.round(((total ?? 0) / (totalAll ?? 1)) * 1000) / 10 : 0,
      daily14: daily,
      dates14: last14,
    });
  } catch (e) {
    console.error("/api/couple/[id]", e);
    return NextResponse.json({ ok: false, reason: "server_error" }, { status: 500 });
  }
}
