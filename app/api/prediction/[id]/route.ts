import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import type { CastMember, PredictionData } from "@/lib/types";

export const dynamic = "force-dynamic";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: mockId } = await params;
  if (process.env.MOCK_DATA === "1") {
    const { mockCouples } = await import("@/lib/mock");
    const couples = mockCouples().slice(0, 2);
    return NextResponse.json({
      ok: true,
      prediction: {
        id: mockId,
        round_no: 1,
        round_label: "5-6회 공개 전",
        nickname: "훈수왕참견러",
        couple_ids: couples.map((c) => c.id),
        couples,
        created_at: new Date().toISOString(),
      },
    });
  }
  try {
    const { id } = await params;
    if (!UUID_RE.test(id)) {
      return NextResponse.json({ ok: false, reason: "not_found" }, { status: 404 });
    }

    const sb = getServiceClient();

    const { data: pred, error } = await sb
      .from("predictions")
      .select("id,round_no,nickname,couple_ids,created_at")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!pred) {
      return NextResponse.json({ ok: false, reason: "not_found" }, { status: 404 });
    }

    const [{ data: round }, { data: coupleRows }, { data: castRows }] = await Promise.all([
      sb.from("rounds").select("label").eq("round_no", pred.round_no).maybeSingle(),
      sb.from("couples").select("id,m_id,f_id").in("id", pred.couple_ids),
      sb.from("cast_members").select("*"),
    ]);

    const castById = new Map<string, CastMember>(
      (castRows ?? []).map((c) => [c.id, c as CastMember])
    );
    // 선택 순서 유지
    const byId = new Map((coupleRows ?? []).map((c) => [c.id, c]));
    const couples = pred.couple_ids
      .map((cid: string) => byId.get(cid))
      .filter(Boolean)
      .map((c: { id: string; m_id: string; f_id: string }) => ({
        id: c.id,
        m: castById.get(c.m_id)!,
        f: castById.get(c.f_id)!,
      }));

    const data: PredictionData = {
      id: pred.id,
      round_no: pred.round_no,
      round_label: round?.label ?? `Round ${pred.round_no}`,
      nickname: pred.nickname,
      couple_ids: pred.couple_ids,
      couples,
      created_at: pred.created_at,
    };

    return NextResponse.json({ ok: true, prediction: data });
  } catch (e) {
    console.error("/api/prediction/[id]", e);
    return NextResponse.json({ ok: false, reason: "server_error" }, { status: 500 });
  }
}
