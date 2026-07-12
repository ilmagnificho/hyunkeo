-- 출연자 페르소나(캐치프레이즈/관전포인트) 컬럼 추가
-- 이미 schema.sql + seed.sql 을 실행한 기존 DB에서 이 파일만 실행하면 됩니다.
-- ⚠️ 아래 문구는 방송 컨셉 기반의 상상 페르소나입니다. 실제 방송 내용에 맞게 자유롭게 수정하세요.
--    (실명/사생활/외모 언급 금지 원칙은 여기서도 동일하게 지켜주세요)

alter table cast_members add column if not exists tagline text not null default '';
alter table cast_members add column if not exists bio text not null default '';

update cast_members set tagline = '게임보다 진심인 순정파', bio = '말수는 적지만 한 번 꽂히면 직진. 조용한 다정함으로 역주행 중.' where id = 'm1';
update cast_members set tagline = '지구 한 바퀴 낭만러', bio = '여행 가방보다 마음을 먼저 여는 타입. 리액션 맛집이라 옆에 있으면 심심할 틈이 없다.' where id = 'm2';
update cast_members set tagline = '웃을 때 치명적', bio = '미소가 무기. 분위기 메이커인데 정작 본인 연애엔 서툴러서 보는 사람이 더 답답하다.' where id = 'm3';
update cast_members set tagline = '계획형 로맨티스트', bio = '숫자엔 강한데 감정 앞에선 버퍼링. 그 갭이 이 사람의 관전 포인트.' where id = 'm4';
update cast_members set tagline = '조용히 등판한 개발자', bio = '메기인데 순한 맛…인 줄 알았다. 후반부 태풍의 눈이 될 수 있는 다크호스.' where id = 'm5';
update cast_members set tagline = '텐션 200% 에너자이저', bio = '등장하자마자 판을 흔든 메기. 직진밖에 모르는 돌직구 스타일.' where id = 'm6';
update cast_members set tagline = '초록빛 힐링 요정', bio = '다정함이 기본값. 모두에게 친절해서 오히려 더 헷갈리게 하는 타입.' where id = 'f1';
update cast_members set tagline = '차분한 책방 언니', bio = '말 한마디에 무게가 있다. 의외로 웃음 포인트가 낮다는 게 반전 매력.' where id = 'f2';
update cast_members set tagline = '싱그러운 마이페이스', bio = '흔들림 없어 보이는데 은근히 귀가 빨개지는 타입. 티 안 내는 설렘 장인.' where id = 'f3';
update cast_members set tagline = '봄바람 설렘 담당', bio = '리액션 하나로 상대를 무장해제. 눈웃음 주의보 발령 중.' where id = 'f4';
update cast_members set tagline = '분위기 반전 아티스트', bio = '메기로 등장해 공기를 바꿨다. 묘하게 자꾸 시선이 가는 사람.' where id = 'f5';
update cast_members set tagline = '고요한 폭풍', bio = '말수 적은 메기. 조용한데… 그런데 왜 자꾸 신경 쓰이지?' where id = 'f6';
