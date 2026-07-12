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
