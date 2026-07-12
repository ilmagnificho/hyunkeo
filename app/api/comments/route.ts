import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
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
