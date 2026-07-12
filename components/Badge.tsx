import type { CastMember } from "@/lib/types";
import { buildAvatar } from "@/lib/pixelart";

// 출연자 도트 아바타 (사진 절대 미사용).
// 출연자 데이터(시드/성별/이모지/컬러)에서 결정적으로 생성된다.
export default function Badge({
  member,
  size = 40,
}: {
  member: CastMember;
  size?: number;
}) {
  const art = buildAvatar(member);
  const px = size / art.size;
  const rects: React.ReactNode[] = [];
  for (let r = 0; r < art.size; r++) {
    for (let c = 0; c < art.size; c++) {
      const ch = art.grid[r][c];
      if (ch === ".") continue;
      rects.push(
        <rect
          key={`${r}-${c}`}
          x={c * px}
          y={r * px}
          width={px}
          height={px}
          fill={art.palette[ch]}
        />
      );
    }
  }
  return (
    <span
      className="inline-flex items-center justify-center rounded-lg shrink-0 overflow-hidden"
      style={{ width: size, height: size, backgroundColor: `${member.color}2E` }}
      aria-label={member.name}
      title={`${member.name} ${member.emoji}`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        shapeRendering="crispEdges"
        aria-hidden
      >
        {rects}
      </svg>
    </span>
  );
}
