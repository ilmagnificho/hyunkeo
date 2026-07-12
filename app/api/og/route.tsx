import { ImageResponse } from "next/og";
import { getServiceClient } from "@/lib/supabase";
import { avatarDataUri } from "@/lib/pixelart";
import { formatKstTimestamp } from "@/lib/kst";
import type { CastMember } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CREAM = "#FFF7F0";
const INK = "#43303B";
const MUTED = "#A58E99";
const PINK = "#FF5C8A";

interface AvatarPair {
  m: CastMember;
  f: CastMember;
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: CREAM,
        backgroundImage:
          "linear-gradient(160deg, rgba(255,92,138,0.16) 0%, rgba(255,247,240,0) 45%, rgba(183,166,255,0.12) 100%)",
        color: INK,
        fontFamily: "sans-serif",
        position: "relative",
      }}
    >
      {children}
    </div>
  );
}

function Heart({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path
        fill="#FF5C8A"
        d="M12 21s-6.7-4.35-9.33-8.11C.9 10.35 1.96 6.5 5.14 5.5 7.1 4.9 9.1 5.6 12 8.2c2.9-2.6 4.9-3.3 6.86-2.7 3.18 1 4.24 4.85 2.47 7.39C18.7 16.65 12 21 12 21z"
      />
    </svg>
  );
}

function Avatar({ member, size }: { member: CastMember; size: number }) {
  return (
    <div
      style={{
        display: "flex",
        width: size,
        height: size,
        borderRadius: size * 0.2,
        backgroundColor: `${member.color}30`,
        overflow: "hidden",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={avatarDataUri(member, 12)} width={size} height={size} alt="" />
    </div>
  );
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  let cast: CastMember[] = [];
  let topPair: AvatarPair | null = null;
  let topNames = "";
  let pred: {
    nickname: string;
    round_no: number;
    created_at: string;
    pairs: AvatarPair[];
  } | null = null;

  try {
    if (process.env.MOCK_DATA === "1") throw new Error("mock");
    const sb = getServiceClient();
    const { data: castRows } = await sb.from("cast_members").select("*");
    cast = (castRows ?? []) as CastMember[];
    const castById = new Map(cast.map((c) => [c.id, c]));

    if (id) {
      // 성지 카드 공유용
      const { data: p } = await sb
        .from("predictions")
        .select("round_no,nickname,couple_ids,created_at")
        .eq("id", id)
        .maybeSingle();
      if (p) {
        const { data: coupleRows } = await sb
          .from("couples")
          .select("id,m_id,f_id")
          .in("id", p.couple_ids);
        const byId = new Map((coupleRows ?? []).map((c) => [c.id, c]));
        pred = {
          nickname: p.nickname,
          round_no: p.round_no,
          created_at: p.created_at,
          pairs: p.couple_ids
            .map((cid: string) => byId.get(cid))
            .filter(Boolean)
            .map((c: { m_id: string; f_id: string }) => ({
              m: castById.get(c.m_id)!,
              f: castById.get(c.f_id)!,
            }))
            .filter((pp: AvatarPair) => pp.m && pp.f),
        };
      }
    } else {
      // 기본 공유용: 현재 1위 커플
      const { data: cheers } = await sb
        .from("cheers")
        .select("couple_id")
        .limit(20000);
      if (cheers && cheers.length > 0) {
        const count = new Map<string, number>();
        for (const ch of cheers) count.set(ch.couple_id, (count.get(ch.couple_id) ?? 0) + 1);
        const topId = [...count.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
        if (topId) {
          const { data: c } = await sb
            .from("couples")
            .select("m_id,f_id")
            .eq("id", topId)
            .maybeSingle();
          if (c) {
            const m = castById.get(c.m_id);
            const f = castById.get(c.f_id);
            if (m && f) {
              topPair = { m, f };
              topNames = `${m.name}♥${f.name}`;
            }
          }
        }
      }
    }
  } catch {
    // DB 실패 시 텍스트만. 개발(MOCK_DATA=1)에서만 목데이터로 아바타 미리보기
    try {
      if (process.env.MOCK_DATA !== "1") throw new Error("no-mock");
      const { mockCast } = await import("@/lib/mock");
      cast = mockCast();
      if (cast.length >= 2) {
        const m = cast.find((c) => c.gender === "M")!;
        const f = cast.find((c) => c.gender === "F")!;
        if (id) {
          pred = {
            nickname: "훈수왕참견러",
            round_no: 1,
            created_at: new Date().toISOString(),
            pairs: [{ m, f }],
          };
        } else {
          topPair = { m, f };
          topNames = `${m.name}♥${f.name}`;
        }
      }
    } catch {
      // 텍스트 전용
    }
  }

  const headers = { "Cache-Control": "public, max-age=3600" };

  /* ---------- 성지 카드 공유 이미지 ---------- */
  if (id && pred) {
    return new ImageResponse(
      (
        <Frame>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 800, color: PINK }}>
            💘 현커거래소 · ROUND {pred.round_no}
          </div>
          <div style={{ display: "flex", fontSize: 58, fontWeight: 800, marginTop: 20 }}>
            🔮 {pred.nickname}님의 최종커플 픽
          </div>
          <div style={{ display: "flex", gap: 28, marginTop: 36 }}>
            {pred.pairs.map((pp, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  backgroundColor: "#FFFFFF",
                  border: "2px solid rgba(255,92,138,0.25)",
                  borderRadius: 24,
                  padding: "18px 26px",
                }}
              >
                <Avatar member={pp.m} size={92} />
                <Heart size={34} />
                <Avatar member={pp.f} size={92} />
                <div style={{ display: "flex", fontSize: 32, fontWeight: 700, marginLeft: 6 }}>
                  {pp.m.name}·{pp.f.name}
                </div>
              </div>
            ))}
          </div>
          <div
            style={{ display: "flex", fontSize: 30, fontWeight: 800, color: PINK, marginTop: 36 }}
          >
            {formatKstTimestamp(pred.created_at)} 락인 · 수정 불가
          </div>
          <div style={{ display: "flex", fontSize: 28, color: MUTED, marginTop: 14 }}>
            적중하면 이 픽은 성지가 됩니다 — 당신의 최애 커플은? 👉
          </div>
        </Frame>
      ),
      { width: 1200, height: 630, headers }
    );
  }

  /* ---------- 기본 공유 이미지 ---------- */
  const men = cast.filter((c) => c.gender === "M").slice(0, 6);
  const women = cast.filter((c) => c.gender === "F").slice(0, 6);

  return new ImageResponse(
    (
      <Frame>
        <div style={{ display: "flex", fontSize: 34, fontWeight: 800, color: PINK }}>
          💘 현커거래소
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 64,
            fontWeight: 800,
            marginTop: 18,
            textAlign: "center",
          }}
        >
          내 최애 커플, 지금 몇 위?
        </div>
        <div style={{ display: "flex", fontSize: 32, color: MUTED, marginTop: 14 }}>
          모솔연애2 실시간 커플 차트 · 매일 하트 리셋 💖
        </div>

        {topPair ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginTop: 34,
              backgroundColor: "#FFFFFF",
              border: "2px solid rgba(255,92,138,0.25)",
              borderRadius: 28,
              padding: "20px 34px",
            }}
          >
            <div style={{ display: "flex", fontSize: 30, fontWeight: 800, color: "#F0A93B" }}>
              👑 지금 1위
            </div>
            <Avatar member={topPair.m} size={96} />
            <Heart size={38} />
            <Avatar member={topPair.f} size={96} />
            <div style={{ display: "flex", fontSize: 36, fontWeight: 800 }}>
              {topPair.m.name}·{topPair.f.name}
            </div>
          </div>
        ) : (
          cast.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                marginTop: 30,
              }}
            >
              <div style={{ display: "flex", gap: 10 }}>
                {men.map((m) => (
                  <Avatar key={m.id} member={m} size={84} />
                ))}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                {women.map((f) => (
                  <Avatar key={f.id} member={f} size={84} />
                ))}
              </div>
            </div>
          )
        )}

        <div
          style={{
            display: "flex",
            marginTop: 32,
            backgroundColor: PINK,
            color: "#FFFFFF",
            fontSize: 30,
            fontWeight: 800,
            borderRadius: 999,
            padding: "16px 38px",
          }}
        >
          최애 커플에게 하트 주러 가기 →
        </div>
      </Frame>
    ),
    { width: 1200, height: 630, headers }
  );
}
