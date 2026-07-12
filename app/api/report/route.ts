import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { bumpIpCounter, getClientIp } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

const HIDE_THRESHOLD = 3;

export async function POST(req: Request) {
  try {
    const { commentId, deviceId } = await req.json();
    if (typeof commentId !== "string" || typeof deviceId !== "string" || !commentId || !deviceId) {
      return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
    }

    const ip = getClientIp(req);
    if (!bumpIpCounter("report", ip, 30)) {
      return NextResponse.json({ ok: false, reason: "rate_limited" }, { status: 429 });
    }

    const sb = getServiceClient();

    // v1: naive increment (기기별 중복 방지는 클라이언트 localStorage 가드)
    const { data: row, error: selErr } = await sb
      .from("comments")
      .select("id,report_count")
      .eq("id", commentId)
      .maybeSingle();
    if (selErr) throw selErr;
    if (!row) {
      return NextResponse.json({ ok: false, reason: "not_found" }, { status: 404 });
    }

    const next = (row.report_count ?? 0) + 1;
    const { error: updErr } = await sb
      .from("comments")
      .update({ report_count: next, hidden: next >= HIDE_THRESHOLD })
      .eq("id", commentId);
    if (updErr) throw updErr;

    return NextResponse.json({ ok: true, hidden: next >= HIDE_THRESHOLD });
  } catch (e) {
    console.error("/api/report", e);
    return NextResponse.json({ ok: false, reason: "server_error" }, { status: 500 });
  }
}
