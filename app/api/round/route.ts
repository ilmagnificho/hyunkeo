import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import type { RoundResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sb = getServiceClient();
    const now = new Date().toISOString();

    const { data, error } = await sb
      .from("rounds")
      .select("round_no,label,lock_at,points")
      .gt("lock_at", now)
      .order("lock_at", { ascending: true })
      .limit(1);
    if (error) throw error;

    if (!data || data.length === 0) {
      return NextResponse.json({ closed: true, serverTime: now } satisfies RoundResponse);
    }

    return NextResponse.json({
      closed: false,
      round: data[0],
      serverTime: now,
    } satisfies RoundResponse);
  } catch (e) {
    console.error("/api/round", e);
    return NextResponse.json(
      { closed: true, serverTime: new Date().toISOString() } satisfies RoundResponse,
      { status: 500 }
    );
  }
}
