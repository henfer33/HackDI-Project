-- Khitbah demo schema. Paste into the Supabase SQL editor.
-- No auth: the app picks a role at launch, so the policies below are wide open.
-- They are DEMO ONLY and must be replaced before this holds anyone's real data.

create table profiles (
  id text primary key,
  role text not null check (role in ('man','woman')),
  name text not null,
  age int not null,
  location text not null,
  education text not null,
  career text not null,
  timeline text not null,
  about text not null default '',
  wali_id text,
  wali_may_send boolean not null default false
);

create table walis (
  id text primary key,
  name text not null,
  relationship text not null,
  contact text not null,
  ward_id text not null
);

create table requests (
  id text primary key,
  man_id text not null,
  woman_id text not null,
  wali_id text not null,
  status text not null check (status in
    ('pending_wali','declined_wali','pending_woman','declined_woman','accepted')),
  note text default '',
  created_at timestamptz default now()
);

create table messages (
  id text primary key,
  request_id text not null references requests(id) on delete cascade,
  sender_id text not null,
  text text not null,
  system boolean not null default false,
  at timestamptz default now()
);

create table meets (
  request_id text primary key references requests(id) on delete cascade,
  initiated_by text not null,
  confirmed_by text
);

alter table profiles enable row level security;
alter table walis    enable row level security;
alter table requests enable row level security;
alter table messages enable row level security;
alter table meets    enable row level security;

create policy demo_all on profiles for all using (true) with check (true);
create policy demo_all on walis    for all using (true) with check (true);
create policy demo_all on requests for all using (true) with check (true);
create policy demo_all on messages for all using (true) with check (true);
create policy demo_all on meets    for all using (true) with check (true);

-- Without this the three simulators will not update each other.
alter publication supabase_realtime add table profiles, requests, messages, meets;
