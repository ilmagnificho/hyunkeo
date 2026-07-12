-- 현커거래소 통합 세팅: schema + seed (Supabase SQL Editor에 통째로 붙여넣고 Run)

create table shows (
  id text primary key,
  name text not null,
  finale_at timestamptz
);

create table cast_members (
  id text primary key,
  show_id text references shows(id),
  name text not null,
  gender text not null check (gender in ('M','F')),
  is_maegi boolean default false,
  emoji text not null,
  color text not null
);

create table couples (
  id text primary key,            -- e.g. 'm1-f5'
  show_id text references shows(id),
  m_id text references cast_members(id),
  f_id text references cast_members(id),
  unique (m_id, f_id)
);

create table rounds (
  round_no int primary key,
  show_id text references shows(id),
  label text not null,            -- e.g. '5-6회 공개 전'
  lock_at timestamptz not null,
  points int not null             -- 3 / 2 / 1
);

create table cheers (
  id uuid primary key default gen_random_uuid(),
  couple_id text references couples(id),
  device_id text not null,
  cheered_on date not null,       -- KST date computed server-side
  created_at timestamptz default now(),
  unique (couple_id, device_id, cheered_on)
);
create index cheers_couple_date on cheers (couple_id, cheered_on);

create table predictions (
  id uuid primary key default gen_random_uuid(),
  round_no int references rounds(round_no),
  device_id text not null,
  nickname text not null check (char_length(nickname) between 1 and 12),
  couple_ids text[] not null check (array_length(couple_ids,1) between 1 and 3),
  created_at timestamptz default now(),
  unique (round_no, device_id)
);

create table comments (
  id uuid primary key default gen_random_uuid(),
  couple_id text references couples(id),
  device_id text not null,
  nickname text not null check (char_length(nickname) between 1 and 12),
  body text not null check (char_length(body) <= 60),
  report_count int default 0,
  hidden boolean default false,
  created_at timestamptz default now()
);

create table results (               -- filled manually after finale
  couple_id text primary key references couples(id),
  is_final boolean not null
);

alter table shows enable row level security;
alter table cast_members enable row level security;
alter table couples enable row level security;
alter table rounds enable row level security;
alter table cheers enable row level security;
alter table predictions enable row level security;
alter table comments enable row level security;
alter table results enable row level security;
-- no policies created: anon/authenticated are denied; service role bypasses RLS.

-- ===== seed =====

insert into shows values ('mosol2', '모태솔로지만 연애는 하고 싶어 시즌2', '2026-07-28T17:00:00+09:00');

insert into cast_members (id, show_id, name, gender, is_maegi, emoji, color) values
('m1','mosol2','재서','M',false,'🎮','#FF6B35'),
('m2','mosol2','정윤','M',false,'🎒','#4ECDC4'),
('m3','mosol2','승현','M',false,'🦷','#95E1D3'),
('m4','mosol2','혁준','M',false,'📊','#F38181'),
('m5','mosol2','진우','M',true ,'💻','#AA96DA'),
('m6','mosol2','태훈','M',true ,'⚡','#FCBAD3'),
('f1','mosol2','서윤','F',false,'💚','#A8D8EA'),
('f2','mosol2','현서','F',false,'📚','#FFD93D'),
('f3','mosol2','한주','F',false,'🌿','#6BCB77'),
('f4','mosol2','수현','F',false,'🌸','#FF8FAB'),
('f5','mosol2','수지','F',true ,'🏺','#B983FF'),
('f6','mosol2','정은','F',true ,'🍵','#94B49F');

insert into couples (id, show_id, m_id, f_id)
select m.id || '-' || f.id, 'mosol2', m.id, f.id
from cast_members m cross join cast_members f
where m.gender='M' and f.gender='F';

insert into rounds (round_no, show_id, label, lock_at, points) values
(1,'mosol2','5-6회 공개 전','2026-07-14T16:59:59+09:00',3),
(2,'mosol2','7-8회 공개 전','2026-07-21T16:59:59+09:00',2),
(3,'mosol2','최종회 공개 전','2026-07-28T16:59:59+09:00',1);
