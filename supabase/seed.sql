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
