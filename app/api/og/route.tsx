import { ImageResponse } from "next/og";
import { getServiceClient } from "@/lib/supabase";
import { formatKstTimestamp } from "@/lib/kst";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 성지 카드 링크 공유 시 미리보기 이미지 (P1)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  let title = "현커거래소";
  let sub = "모솔연애2 실시간 커플 차트 & 최종커플 픽";
  let lines: string[] = [];
  let ts = "";

  if (id) {
    try {
      const sb = getServiceClient();
      const { data: pred } = await sb
        .from("predictions")
        .select("round_no,nickname,couple_ids,created_at")
        .eq("id", id)
        .maybeSingle();
      if (pred) {
        const [{ data: coupleRows }, { data: castRows }] = await Promise.all([
          sb.from("couples").select("id,m_id,f_id").in("id", pred.couple_ids),
          sb.from("cast_members").select("id,name"),
        ]);
        const nameById = new Map((castRows ?? []).map((c) => [c.id, c.name]));
        const byId = new Map((coupleRows ?? []).map((c) => [c.id, c]));
        title = `${pred.nickname}의 최종커플 픽`;
        sub = `ROUND ${pred.round_no} 락인 완료 💌`;
        lines = pred.couple_ids
          .map((cid: string) => byId.get(cid))
          .filter(Boolean)
          .map(
            (c: { m_id: string; f_id: string }) =>
              `${nameById.get(c.m_id) ?? "?"} ♥ ${nameById.get(c.f_id) ?? "?"}`
          );
        ts = `${formatKstTimestamp(pred.created_at)} 락인`;
      }
    } catch {
      // 데이터 조회 실패 시 기본 카드
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FFF7F0",
          color: "#43303B",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 40, fontWeight: 800, color: "#FF5C8A" }}>💘 현커거래소</div>
        <div style={{ fontSize: 56, fontWeight: 800, marginTop: 24 }}>{title}</div>
        <div style={{ fontSize: 30, color: "#A58E99", marginTop: 12 }}>{sub}</div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: 28,
          }}
        >
          {lines.map((l, i) => (
            <div key={i} style={{ fontSize: 44, fontWeight: 700, marginTop: 8 }}>
              {l}
            </div>
          ))}
        </div>
        {ts && (
          <div style={{ fontSize: 28, color: "#FF5C7A", marginTop: 32, fontWeight: 700 }}>
            {ts}
          </div>
        )}
        <div style={{ fontSize: 22, color: "#8B93A7", marginTop: 40 }}>
          종영 후 적중 시 이 카드는 성지가 됩니다
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
