import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { containsBanned, MODERATION_REJECT_MESSAGE } from "@/lib/moderation";
import { kstDayStartUtcIso } from "@/lib/kst";
import { bumpIpCounter, getClientIp } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

const DAILY_LIMIT = 10;

export async function POST(req: Request) {
  try {
    const { coupleId, deviceId, nickname, body } = await req.json();

    if (
      typeof coupleId !== "string" ||
      typeof deviceId !== "string" ||
      typeof nickname !== "string" ||
      typeof body !== "string" ||
      !coupleId ||
      !deviceId
    ) {
      return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
    }

    const nick = nickname.trim();
    const text = body.trim();
    if (nick.length < 1 || nick.length > 12) {
      return NextResponse.json({ ok: false, reason: "bad_nickname" }, { status: 400 });
    }
    if (text.length < 1 || text.length > 60) {
      return NextResponse.json({ ok: false, reason: "bad_body" }, { status: 400 });
    }
    if (containsBanned(nick) || containsBanned(text)) {
      return NextResponse.json(
        { ok: false, reason: "moderation", message: MODERATION_REJECT_MESSAGE },
        { status: 400 }
      );
    }

    const ip = getClientIp(req);
    if (!bumpIpCounter("comment", ip, DAILY_LIMIT)) {
      return NextResponse.json({ ok: false, reason: "rate_limited" }, { status: 429 });
    }

    const sb = getServiceClient();

    // device 기준 일일 제한 (KST 오늘 작성 수)
    const { count, error: countErr } = await sb
      .from("comments")
      .select("id", { count: "exact", head: true })
      .eq("device_id", deviceId)
      .gte("created_at", kstDayStartUtcIso());
    if (countErr) throw countErr;
    if ((count ?? 0) >= DAILY_LIMIT) {
      return NextResponse.json({ ok: false, reason: "rate_limited" }, { status: 429 });
    }

    const { data, error } = await sb
      .from("comments")
      .insert({ couple_id: coupleId, device_id: deviceId, nickname: nick, body: text })
      .select("id,nickname,body,created_at")
      .single();
    if (error) {
      if (error.code === "23503") {
        return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json({ ok: true, comment: data });
  } catch (e) {
    console.error("/api/comment", e);
    return NextResponse.json({ ok: false, reason: "server_error" }, { status: 500 });
  }
}
