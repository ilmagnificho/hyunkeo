-- 출연자 페르소나(캐치프레이즈/관전포인트) 컬럼 추가 + 실제 방송 기반 문구
-- 이미 schema.sql + seed.sql 을 실행한 기존 DB에서 이 파일만 실행하면 됩니다. (재실행해도 안전)
--
-- 문구 출처: 공개 방송 내용 및 언론 보도(공식 프로필/제작발표회) 기반.
-- 사생활 추측/외모 품평 금지 원칙을 지키며, 방송 진행에 따라 자유롭게 업데이트하세요.

alter table cast_members add column if not exists tagline text not null default '';
alter table cast_members add column if not exists bio text not null default '';

-- 남자 초기 멤버
update cast_members set tagline = '전설의 흰수염, 배그 개발자', bio = '카이스트 수리과학과 출신 게임 개발자. 선공개 흰수염 비주얼로 전설을 찍고 깔끔하게 등장한 반전의 주인공.' where id = 'm1';
update cast_members set tagline = '눈맞춤도 어려운 순수 그 자체', bio = '이성과 눈 마주치는 것도 힘들어하는 진짜 모솔 취준생. 그래서 한 걸음 한 걸음이 더 소중하다.' where id = 'm2';
update cast_members set tagline = '이성 앞에서만 얼어붙는 치과의사', bio = '진료할 땐 프로, 연애 앞에선 왕초보. 극도로 긴장하는 모습이 오히려 응원 포인트.' where id = 'm3';
update cast_members set tagline = '마음에 벽 쌓은 마케터', bio = '어장관리에 데인 아픔으로 신중해진 대기업 마케터. 그 벽이 무너지는 순간이 관전 포인트.' where id = 'm4';
-- 남자 메기
update cast_members set tagline = '랜선 연애 1년, 실전은 처음', bio = '채팅으로만 1년 연애해 본 00년생 건축학도. 첫날부터 등판해 판을 흔든 메기.' where id = 'm5';
update cast_members set tagline = '마지막 연애가 중학교 시절', bio = '중학교 이후 연애 경험이 없다는 97년생 메기. 그래서 더 예측불가.' where id = 'm6';
-- 여자 초기 멤버
update cast_members set tagline = '10년차 아이돌 덕후', bio = '모솔 29년차. 최애 생일파티와 데이트 사이에서 고민하는 진성 덕후, 덕질 세포와 연애 세포가 다르다는 걸 증명하러 왔다.' where id = 'f1';
update cast_members set tagline = '만화 속 로맨스가 더 익숙한', bio = '만화를 깊게 파는 덕후. 2D보다 설레는 3D 로맨스를 찾을 수 있을까.' where id = 'f2';
update cast_members set tagline = '필터 없는 돌직구 한의사', bio = '자칭 "이 직업치고 외모가 나쁘지 않은" 한의사. 거침없는 입담이 시그니처.' where id = 'f3';
update cast_members set tagline = '온 가족이 응원하는 모솔', bio = '가족 전원이 출연을 응원해 준 차녀. "너랑 있으면 편안하다"는 말을 가장 듣고 싶어 한다.' where id = 'f4';
-- 여자 메기
update cast_members set tagline = '영국 유학파 도예가', bio = '등장하자마자 시선을 집중시킨 메기. 작업실에서 혼자 작업하던 아티스트가 합숙에 왔다.' where id = 'f5';
update cast_members set tagline = '5년차 한의사 메기', bio = '차분한 공기를 몰고 온 메기 한의사. 조용한데 존재감이 있다. 한의사 더비의 한 축.' where id = 'f6';
