import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (process.env.MOCK_DATA === "1") {
    return NextResponse.json({
      ok: true,
      comments: [
        { id: "c1", nickname: "눈빛감별사", body: "3화 편의점 씬 눈빛 보고 왔는데 이건 진짜다", created_at: new Date().toISOString() },
        { id: "c2", nickname: "훈수9단", body: "메기 등판해도 안 흔들릴 조합", created_at: new Date().toISOString() },
      ],
    });
  }
  try {
    const { searchParams } = new URL(req.url);
    const coupleId = searchParams.get("coupleId");
    if (!coupleId) {
      return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
    }

    const sb = getServiceClient();
    const { data, error } = await sb
      .from("comments")
      .select("id,nickname,body,created_at")
      .eq("couple_id", coupleId)
      .eq("hidden", false)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;

    return NextResponse.json({ ok: true, comments: data ?? [] });
  } catch (e) {
    console.error("/api/comments", e);
    return NextResponse.json({ ok: false, reason: "server_error" }, { status: 500 });
  }
}
