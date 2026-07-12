import type { CastMember } from "@/lib/types";

// 출연자 이니셜 배지: 컬러 원 + 첫 음절 + 작은 이모지 (사진 절대 미사용)
export default function Badge({
  member,
  size = 40,
}: {
  member: CastMember;
  size?: number;
}) {
  const initial = member.name.charAt(0);
  return (
    <span
      className="relative inline-flex items-center justify-center rounded-full font-bold text-board shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: member.color,
        fontSize: size * 0.42,
      }}
      aria-label={member.name}
    >
      {initial}
      <span
        className="absolute -bottom-0.5 -right-0.5 leading-none"
        style={{ fontSize: size * 0.35 }}
        aria-hidden
      >
        {member.emoji}
      </span>
    </span>
  );
}
