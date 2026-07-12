# 현커거래소 💘📈

넷플릭스 '모태솔로지만 연애는 하고 싶어 시즌2' 비공식 팬 서비스.
커플 지지율을 주식 시세처럼 확인하고, 최종커플 예측을 락인해서 성지 카드를 받으세요.

> "당신의 훈수, 이제 시세로 증명하세요"

## 기능

- **실시간 커플 차트** (`/`): 누적 하트 순위, 음원차트식 순위 변동(▲2/▼1/NEW), 화력 게이지, 1일 1하트
- **최종커플 픽 락인** (`/predict`): 라운드별(회차 공개 전 마감) 최종커플 1~3쌍 픽. 제출 후 수정 불가
- **성지 카드** (`/card/[id]`): 1080x1350 캔버스 카드 → PNG 저장 / 링크 복사 / OG 미리보기
- **커플 상세** (`/couple/[id]`): 케미 온도, 14일 하트 추이, 한 줄 훈수(60자, 금칙어 필터, 신고 3회 자동 블라인드)

## 운영 원칙 (타협 불가)

1. 출연자 사진/방송 캡처 사용 금지 — 데이터에서 자동 생성되는 도트 캐릭터로만 표현 (lib/pixelart.ts)
2. 성(姓) 미표기 — 이름만 사용
3. 로그인/개인정보 수집 없음 — 닉네임 + 기기 UUID(localStorage)만
4. 자유게시판 없음 — 60자 한 줄 훈수만, 강한 모더레이션

## 기술 스택

- Next.js (App Router, TypeScript) + Tailwind CSS
- Supabase (Postgres) — 모든 읽기/쓰기는 Route Handler에서 service role 키로만 수행 (RLS deny-all)
- 차트: 인라인 SVG / 카드: 클라이언트 canvas

## 로컬 실행

### 1. Supabase 프로젝트 준비

1. [supabase.com](https://supabase.com) 에서 새 프로젝트 생성
2. SQL Editor 에서 `supabase/schema.sql` 내용 붙여넣고 실행
3. 이어서 `supabase/seed.sql` 실행 (출연자 12명 / 커플 36개 / 라운드 3개 시드)
4. Project Settings → API 에서 URL 과 `service_role` 키 확인

> RLS는 전 테이블 활성화 + 정책 없음(deny-all) 상태입니다. anon 키로는 아무것도 읽고 쓸 수 없고, 서버의 service role 키만 데이터에 접근합니다. 의도된 설계이니 정책을 추가하지 마세요.

### 2. 환경변수

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # 서버 전용. 절대 NEXT_PUBLIC_ 금지
```

### 3. 실행

```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # 프로덕션 빌드 확인
```

## Vercel 배포

1. GitHub 리포지토리를 Vercel 에 Import
2. Environment Variables 에 위 두 변수 등록 (`SUPABASE_SERVICE_ROLE_KEY` 는 반드시 서버 전용)
3. Deploy — 끝. (프레임워크 자동 감지: Next.js)

### 선택 환경변수

```
NEXT_PUBLIC_SITE_URL=https://hyunkeo.vercel.app  # 커스텀 도메인 쓰면 변경 (OG/sitemap 기준 URL)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX                   # GA4 측정 ID (없으면 트래킹 비활성)
```

## 출연자 페르소나 (마이그레이션)

캐릭터 서사(캐치프레이즈/관전포인트)는 `supabase/migration-001-cast-personas.sql` 을
SQL Editor 에서 실행하면 활성화됩니다. 재실행해도 안전합니다(idempotent).

현재 문구는 공개 방송 내용과 언론 보도(공식 프로필/제작발표회 기사) 기반입니다.
회차가 공개될 때마다 `update cast_members set tagline=..., bio=... where id='m1';` 으로
계속 업데이트하는 것을 추천합니다 — 도감이 살아있는 콘텐츠가 됩니다.
사생활 추측/외모 품평 문구는 금지 원칙에 따라 넣지 마세요.
마이그레이션을 실행하지 않아도 사이트는 정상 동작합니다(페르소나 미표시).

## 분석 (GA4)

`NEXT_PUBLIC_GA_ID` 설정 시 자동 수집되는 이벤트 (`lib/analytics.ts`):

| 이벤트 | 의미 | 파라미터 |
|---|---|---|
| `cheer` | 하트 주기 | couple_id |
| `predict_start` | 픽 플로우 진입 | round_no |
| `predict_lock` | **픽 락인 (핵심 전환)** | round_no, couples_count |
| `card_save` | **성지 카드 저장 (바이럴)** | prediction_id |
| `card_copy_link` | 카드 링크 복사 | prediction_id |
| `comment_submit` | 훈수 등록 | couple_id |
| `chart_tab` | 차트 탭 전환 | tab |

GA4 에서 `predict_lock`/`card_save` 를 전환(Key event)으로 지정하는 것을 추천합니다.

## SEO / GEO / OG

- `app/sitemap.ts` — 커플 상세 36개 포함 동적 생성 (`/sitemap.xml`)
- `app/robots.ts` — `/api/` 차단, sitemap 연결
- 구조화 데이터: WebSite(전역), FAQPage(`/about`) — 생성형 검색(GEO) 대응
- 커플 페이지 동적 메타: "재서♥수지 실시간 케미 온도·하트 순위" (롱테일 검색 유입)
- OG/트위터 카드: 기본 `/api/og`, 성지 카드는 `/api/og?id=...`
- 런칭 후 할 일: Google Search Console 에 sitemap 제출, 네이버 서치어드바이저 등록

## 시즌 종영 후 운영 가이드

### 1. 정답 입력

최종회 공개 후 Supabase SQL Editor 에서 최종커플을 `results` 에 입력합니다:

```sql
-- 예: 재서-수지, 정윤-서윤 커플이 최종 성사된 경우
insert into results (couple_id, is_final) values
('m1-f5', true),
('m2-f1', true);
```

### 2. 채점 로직 위치

훈수 점수 채점은 아래 쿼리로 계산합니다 (라운드별 배점: R1=3점 / R2=2점 / R3=1점).
`predictions.couple_ids` 배열에 정답 커플이 하나라도 포함되면 해당 라운드 적중입니다:

```sql
select p.nickname, p.device_id,
       sum(r.points) as score
from predictions p
join rounds r on r.round_no = p.round_no
where exists (
  select 1 from results res
  where res.is_final and res.couple_id = any(p.couple_ids)
)
group by p.nickname, p.device_id
order by score desc;
```

리더보드 페이지(P1)를 붙일 때 이 쿼리를 `/api/leaderboard` Route Handler 로 옮기면 됩니다.
적중자 성지 카드의 "선지자 인증" 골드 카드 업그레이드는 `results` 테이블 존재 여부를
`/api/prediction/[id]` 에서 조회해 카드 렌더에 골드 테마를 적용하는 방식으로 확장하세요.

### 3. 다음 시즌/다른 프로그램 재사용

출연자·커플·라운드가 전부 데이터입니다. 코드에 출연자 이름이 하드코딩되어 있지 않으므로,
새 `shows` / `cast_members` / `couples` / `rounds` 시드만 넣으면 그대로 재사용됩니다.

## 모더레이션 운영

- 금칙어 목록: `lib/moderation.ts` 의 `BANNED_WORDS` 배열 하나만 수정하면 됩니다. 공백/특수문자 우회는 자동 대응됩니다.
- 신고 3회 누적 시 자동 블라인드 (`comments.hidden = true`).
- 수동 블라인드: `update comments set hidden = true where id = '...';`

## 면책

본 사이트는 비공식 팬 서비스로, 넷플릭스 및 제작사와 무관합니다.
출연자 비방/사생활 추측 콘텐츠를 금지합니다.
