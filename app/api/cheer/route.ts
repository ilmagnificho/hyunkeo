import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { kstDateString } from "@/lib/kst";
import { bumpIpCounter, getClientIp } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

const DAILY_LIMIT = 40;

export async function POST(req: Request) {
  try {
    const { coupleId, deviceId } = await req.json();
    if (typeof coupleId !== "string" || typeof deviceId !== "string" || !coupleId || !deviceId) {
      return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
    }

    // IP 기준 일일 제한 (인메모리)
    const ip = getClientIp(req);
    if (!bumpIpCounter("cheer", ip, DAILY_LIMIT)) {
      return NextResponse.json({ ok: false, reason: "rate_limited" }, { status: 429 });
    }

    const sb = getServiceClient();
    const today = kstDateString();

    // device 기준 일일 제한 (DB count)
    const { count, error: countErr } = await sb
      .from("cheers")
      .select("id", { count: "exact", head: true })
      .eq("device_id", deviceId)
      .eq("cheered_on", today);
    if (countErr) throw countErr;
    if ((count ?? 0) >= DAILY_LIMIT) {
      return NextResponse.json({ ok: false, reason: "rate_limited" }, { status: 429 });
    }

    const { error } = await sb.from("cheers").insert({
      couple_id: coupleId,
      device_id: deviceId,
      cheered_on: today,
    });

    if (error) {
      // unique 위반 = 오늘 이미 응원함
      if (error.code === "23505") {
        return NextResponse.json({ ok: false, reason: "already" });
      }
      // FK 위반 = 존재하지 않는 커플
      if (error.code === "23503") {
        return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("/api/cheer", e);
    return NextResponse.json({ ok: false, reason: "server_error" }, { status: 500 });
  }
}
