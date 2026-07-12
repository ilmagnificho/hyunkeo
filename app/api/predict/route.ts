import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { containsBanned } from "@/lib/moderation";
import { bumpIpCounter, getClientIp } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { deviceId, nickname, coupleIds } = await req.json();

    if (
      typeof deviceId !== "string" ||
      !deviceId ||
      typeof nickname !== "string" ||
      !Array.isArray(coupleIds)
    ) {
      return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
    }

    const nick = nickname.trim();
    if (nick.length < 1 || nick.length > 12) {
      return NextResponse.json({ ok: false, reason: "bad_nickname" }, { status: 400 });
    }
    if (containsBanned(nick)) {
      return NextResponse.json({ ok: false, reason: "moderation" }, { status: 400 });
    }
    const ids = coupleIds.filter((c: unknown) => typeof c === "string");
    const uniqueIds = Array.from(new Set(ids));
    if (uniqueIds.length < 1 || uniqueIds.length > 3) {
      return NextResponse.json({ ok: false, reason: "bad_couples" }, { status: 400 });
    }

    const ip = getClientIp(req);
    if (!bumpIpCounter("predict", ip, 30)) {
      return NextResponse.json({ ok: false, reason: "rate_limited" }, { status: 429 });
    }

    const sb = getServiceClient();

    // 현재 라운드 확인
    const now = new Date().toISOString();
    const { data: rounds, error: roundErr } = await sb
      .from("rounds")
      .select("round_no,label,lock_at")
      .gt("lock_at", now)
      .order("lock_at", { ascending: true })
      .limit(1);
    if (roundErr) throw roundErr;
    if (!rounds || rounds.length === 0) {
      return NextResponse.json({ ok: false, reason: "closed" });
    }
    const round = rounds[0];

    // 기존 제출 확인 — 예측은 불변 (성지의 핵심)
    const { data: existing, error: existErr } = await sb
      .from("predictions")
      .select("id,created_at")
      .eq("round_no", round.round_no)
      .eq("device_id", deviceId)
      .maybeSingle();
    if (existErr) throw existErr;
    if (existing) {
      return NextResponse.json({ ok: false, reason: "locked", prediction: existing });
    }

    const { data: inserted, error: insErr } = await sb
      .from("predictions")
      .insert({
        round_no: round.round_no,
        device_id: deviceId,
        nickname: nick,
        couple_ids: uniqueIds,
      })
      .select("id,created_at")
      .single();

    if (insErr) {
      if (insErr.code === "23505") {
        // 레이스: 동시 제출 → 기존 것 반환
        const { data: again } = await sb
          .from("predictions")
          .select("id,created_at")
          .eq("round_no", round.round_no)
          .eq("device_id", deviceId)
          .maybeSingle();
        return NextResponse.json({ ok: false, reason: "locked", prediction: again });
      }
      throw insErr;
    }

    return NextResponse.json({ ok: true, prediction: inserted });
  } catch (e) {
    console.error("/api/predict", e);
    return NextResponse.json({ ok: false, reason: "server_error" }, { status: 500 });
  }
}
