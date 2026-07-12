export interface CastMember {
  id: string;
  name: string;
  gender: "M" | "F";
  is_maegi: boolean;
  emoji: string;
  color: string;
  tagline?: string; // 캐치프레이즈 (migration-001)
  bio?: string;     // 관전 포인트 (migration-001)
}

export interface CoupleInfo {
  id: string;
  m: CastMember;
  f: CastMember;
}

export interface BoardRow {
  coupleId: string;
  m: CastMember;
  f: CastMember;
  total: number;
  sharePct: number;       // 전체 응원 대비 %
  todayCount: number;
  yesterdayCount: number;
  deltaPp: number;        // 어제 지지율 대비 %p
  rankChange: number | null; // 어제 순위 대비 (+2 = 두 계단 상승, null = 신규 진입)
  spark7: number[];       // 최근 7일 일별 응원 수 (과거→오늘)
}

export interface BoardResponse {
  ok: boolean;
  totalCheers: number;
  rows: BoardRow[];
  couples?: CoupleInfo[]; // 빈 상태(전체 0)일 때 전 커플 목록
}

export interface RoundInfo {
  round_no: number;
  label: string;
  lock_at: string;
  points: number;
}

export interface RoundResponse {
  closed: boolean;
  round?: RoundInfo;
  serverTime: string;
}

export interface PredictionData {
  id: string;
  round_no: number;
  round_label: string;
  nickname: string;
  couple_ids: string[];
  couples: CoupleInfo[];
  created_at: string;
}

export interface CommentRow {
  id: string;
  nickname: string;
  body: string;
  created_at: string;
}
