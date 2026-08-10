-- ============================================================
-- ต่อคิว / TorQueue — Supabase schema
-- ลูกค้า: ไม่ต้องล็อกอิน ค้นหาคิวด้วยรหัส (เช่น MK001) หรือชื่อ
-- แอดมิน: ใช้ Supabase Auth (email + password) จัดการทุกอย่าง
-- รันไฟล์นี้ใน Supabase SQL Editor ได้เลย
-- ============================================================

-- ---------- 0) ENUM ----------
create type lot_status       as enum ('open', 'closed');
create type work_stage       as enum ('waiting', 'sketch', 'payment', 'coloring', 'completed');
create type queue_state      as enum ('active', 'paused', 'cancelled');
create type payment_status   as enum ('unpaid', 'paid');
create type quotation_status as enum ('draft', 'issued');

-- ---------- 1) ADMIN ----------
-- แถวนี้ผูกกับ auth.users ของ Supabase Auth
-- สร้าง user ใน Dashboard > Authentication แล้ว insert id เดียวกันลงตารางนี้
create table admins (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Artist',
  created_at   timestamptz not null default now()
);

-- ใช้เช็คสิทธิ์ในทุก policy
create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from admins a where a.id = auth.uid());
$$;

-- ---------- 2) LOT (ล็อตงาน) ----------
create table lots (
  lot_number int primary key,                 -- 1, 2, 3 ... ใช้เป็น PK ตรง ๆ อ่านง่าย
  capacity   int not null default 10 check (capacity > 0),
  status     lot_status not null default 'open',
  opened_at  timestamptz not null default now(),
  closed_at  timestamptz,
  note       text
);

-- เปิดได้ทีละ 1 lot เท่านั้น
create unique index one_open_lot on lots (status) where status = 'open';

-- ---------- 3) QUEUE ENTRY (ลูกค้า 1 คน = 1 คิว) ----------
create table queue_entries (
  id            uuid primary key default gen_random_uuid(),
  lot_number    int  not null references lots(lot_number) on delete restrict,
  queue_number  int  not null,                       -- 1..capacity ไม่มีการเรียงใหม่
  code          text not null unique
                check (code ~ '^[A-Z]{2}[0-9]{3}$'), -- MK001
  customer_name text not null,
  contact       text,                                -- IG / Discord / เบอร์

  -- รายละเอียดงาน
  commission_type text,                              -- 'Half Body' | 'Bust' | 'Full Body'
  character_count int not null default 1 check (character_count > 0),
  dimensions      text,                              -- '3000 x 4000 px'
  note            text,

  -- สถานะ: แยก stage (ขั้นตอน) กับ state (สภาพคิว)
  -- แยกกันเพราะ "หยุดชั่วคราว/ยกเลิก" ต้องไม่ลบขั้นตอนเดิมทิ้ง
  stage             work_stage  not null default 'waiting',
  state             queue_state not null default 'active',
  paused_at         timestamptz,
  resume_expected_at date,
  cancelled_at      timestamptz,

  -- การเงิน (ไม่มีระบบจ่ายเงินจริง แค่ธงสถานะ)
  payment_status payment_status not null default 'unpaid',
  amount_paid    numeric(10,2),
  paid_at        timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (lot_number, queue_number)
);

create index queue_entries_lot_idx   on queue_entries (lot_number, queue_number);
create index queue_entries_name_idx  on queue_entries (lower(customer_name));

-- ---------- 4) SKETCH (ไฟล์ใน Supabase Storage) ----------
create table sketches (
  id           uuid primary key default gen_random_uuid(),
  entry_id     uuid not null references queue_entries(id) on delete cascade,
  storage_path text not null,                 -- path ใน bucket 'sketches'
  label        text,                          -- 'SKETCH 01', 'LINEART', 'WIP COLOR'
  sort_order   int not null default 0,
  created_at   timestamptz not null default now()
);

create index sketches_entry_idx on sketches (entry_id, sort_order);

-- ---------- 5) QUOTATION (ออกครั้งเดียวหลังร่างเสร็จ) ----------
create table quotations (
  id         uuid primary key default gen_random_uuid(),
  entry_id   uuid not null unique references queue_entries(id) on delete cascade,
  doc_number text not null unique,            -- QT-2569-014
  status     quotation_status not null default 'draft',
  discount   numeric(10,2) not null default 0,
  terms      text,
  issued_at  timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table quotation_items (
  id           uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references quotations(id) on delete cascade,
  title        text not null,
  qty          int not null default 1 check (qty > 0),
  unit_price   numeric(10,2) not null default 0,
  amount       numeric(10,2) generated always as (qty * unit_price) stored,
  sort_order   int not null default 0
);

create index quotation_items_idx on quotation_items (quotation_id, sort_order);

-- ---------- 6) ACTIVITY LOG (แถบ "ประวัติ" ในหน้าแก้ไขลูกค้า) ----------
create table activity_logs (
  id         uuid primary key default gen_random_uuid(),
  entry_id   uuid not null references queue_entries(id) on delete cascade,
  action     text not null,                   -- 'stage_changed', 'payment_received', ...
  detail     text,
  actor_id   uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index activity_logs_idx on activity_logs (entry_id, created_at desc);

-- ---------- 7) SETTINGS (แถวเดียว) ----------
create table site_settings (
  id             boolean primary key default true check (id),
  studio_name    text not null default 'ต่อคิว Studio',
  contact_handle text default '@torqueue.art',
  updated_at     timestamptz not null default now()
);

insert into site_settings (id) values (true);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- updated_at
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger trg_entries_touch  before update on queue_entries
  for each row execute function touch_updated_at();
create trigger trg_quotation_touch before update on quotations
  for each row execute function touch_updated_at();

-- ออกเลขคิวอัตโนมัติ + กันเพิ่มเกิน capacity / lot ที่ปิดแล้ว
create or replace function assign_queue_number()
returns trigger language plpgsql as $$
declare
  v_lot   lots%rowtype;
  v_count int;
begin
  select * into v_lot from lots where lot_number = new.lot_number for update;

  if v_lot.status = 'closed' then
    raise exception 'Lot % ปิดไปแล้ว เพิ่มลูกค้าไม่ได้', new.lot_number;
  end if;

  select count(*) into v_count from queue_entries where lot_number = new.lot_number;
  if v_count >= v_lot.capacity then
    raise exception 'Lot % เต็มแล้ว (%/%)', new.lot_number, v_count, v_lot.capacity;
  end if;

  if new.queue_number is null then
    new.queue_number := v_count + 1;
  end if;

  return new;
end $$;

create trigger trg_assign_queue_number before insert on queue_entries
  for each row execute function assign_queue_number();

-- บันทึกประวัติเมื่อสถานะเปลี่ยน + เซ็ตเวลา pause/cancel ให้อัตโนมัติ
create or replace function log_entry_change()
returns trigger language plpgsql as $$
begin
  if new.stage is distinct from old.stage then
    insert into activity_logs (entry_id, action, detail, actor_id)
    values (new.id, 'stage_changed', old.stage || ' -> ' || new.stage, auth.uid());
  end if;

  if new.state is distinct from old.state then
    if new.state = 'paused'    then new.paused_at    := now(); end if;
    if new.state = 'cancelled' then new.cancelled_at := now(); end if;
    if new.state = 'active'    then new.paused_at    := null;  end if;

    insert into activity_logs (entry_id, action, detail, actor_id)
    values (new.id, 'state_changed', old.state || ' -> ' || new.state, auth.uid());
  end if;

  if new.payment_status = 'paid' and old.payment_status = 'unpaid' then
    new.paid_at := coalesce(new.paid_at, now());
    insert into activity_logs (entry_id, action, detail, actor_id)
    values (new.id, 'payment_received', coalesce(new.amount_paid::text, ''), auth.uid());
  end if;

  return new;
end $$;

create trigger trg_log_entry_change before update on queue_entries
  for each row execute function log_entry_change();

-- ============================================================
-- VIEWS — คำนวณ "เหลืออีกกี่คิว" และความคืบหน้าของ lot
-- ============================================================

create or replace view lot_progress as
select
  l.lot_number,
  l.capacity,
  l.status,
  l.opened_at,
  l.closed_at,
  count(e.id)                                              as total_entries,
  count(*) filter (where e.stage = 'completed')            as done_count,
  min(e.queue_number) filter
    (where e.state = 'active' and e.stage <> 'completed')   as current_queue_number
from lots l
left join queue_entries e on e.lot_number = l.lot_number
group by l.lot_number;

create or replace view queue_public as
select
  e.id,
  e.code,
  e.customer_name,
  e.lot_number,
  e.queue_number,
  e.stage,
  e.state,
  e.paused_at,
  e.resume_expected_at,
  e.commission_type,
  e.character_count,
  e.dimensions,
  e.note,
  e.payment_status,
  e.amount_paid,
  e.paid_at,
  e.updated_at,
  lp.capacity,
  lp.done_count,
  lp.status as lot_status,
  (
    select count(*)
    from queue_entries x
    where x.lot_number = e.lot_number
      and x.queue_number < e.queue_number
      and x.state = 'active'
      and x.stage <> 'completed'
  ) as queues_ahead
from queue_entries e
join lot_progress lp on lp.lot_number = e.lot_number;

-- ============================================================
-- RPC สำหรับฝั่งลูกค้า (ไม่ล็อกอิน)
-- ปิด SELECT ตรง ๆ ทั้งหมด แล้วให้ anon เรียกได้แค่ 3 ฟังก์ชันนี้
-- => ลูกค้าเห็นได้เฉพาะคิวที่รู้รหัส/ชื่อ ไม่ dump ทั้งตาราง
-- ============================================================

-- 1) แถบบนหน้า Landing: "Lot 03 กำลังเปิดรับ · 7/10 คิว"
create or replace function get_active_lot()
returns table (lot_number int, capacity int, total_entries bigint)
language sql stable security definer set search_path = public as $$
  select lp.lot_number, lp.capacity, lp.total_entries
  from lot_progress lp
  where lp.status = 'open'
  limit 1;
$$;

-- 2) หน้าค้นหา + หน้าคิวลูกค้า (ค้นด้วยรหัสหรือชื่อ, เฉพาะ lot ที่ยังเปิด)
create or replace function find_queue(p_keyword text)
returns setof queue_public
language sql stable security definer set search_path = public as $$
  select *
  from queue_public q
  where q.lot_status = 'open'
    and (upper(q.code) = upper(trim(p_keyword))
         or lower(q.customer_name) = lower(trim(p_keyword)))
  order by q.queue_number;
$$;

-- 3) ภาพร่าง + ใบเสนอราคา (ใบเสนอราคาโชว์เฉพาะที่ issued แล้ว)
create or replace function get_queue_detail(p_code text)
returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'queue',    to_jsonb(q),
    'sketches', coalesce((
        select jsonb_agg(to_jsonb(s) order by s.sort_order)
        from sketches s where s.entry_id = q.id), '[]'::jsonb),
    'quotation', (
        select jsonb_build_object(
          'doc_number', qt.doc_number,
          'issued_at',  qt.issued_at,
          'discount',   qt.discount,
          'terms',      qt.terms,
          'items', coalesce((
            select jsonb_agg(to_jsonb(i) order by i.sort_order)
            from quotation_items i where i.quotation_id = qt.id), '[]'::jsonb))
        from quotations qt
        where qt.entry_id = q.id and qt.status = 'issued')
  )
  from queue_public q
  where upper(q.code) = upper(trim(p_code)) and q.lot_status = 'open';
$$;

-- ============================================================
-- RLS — เขียน/อ่านตรง ๆ ได้เฉพาะแอดมินที่ล็อกอิน
-- ============================================================

alter table admins          enable row level security;
alter table lots            enable row level security;
alter table queue_entries   enable row level security;
alter table sketches        enable row level security;
alter table quotations      enable row level security;
alter table quotation_items enable row level security;
alter table activity_logs   enable row level security;
alter table site_settings   enable row level security;

create policy admin_self on admins
  for select to authenticated using (id = auth.uid());

create policy admin_all on lots            for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_all on queue_entries   for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_all on sketches        for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_all on quotations      for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_all on quotation_items for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_all on activity_logs   for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_all on site_settings   for all to authenticated using (is_admin()) with check (is_admin());

-- anon เข้าถึงได้เฉพาะผ่าน RPC ข้างบน
revoke all on queue_public, lot_progress from anon;
grant execute on function get_active_lot(), find_queue(text), get_queue_detail(text) to anon, authenticated;

-- ============================================================
-- STORAGE — bucket สำหรับภาพร่าง
-- ============================================================
insert into storage.buckets (id, name, public)
values ('sketches', 'sketches', true)
on conflict (id) do nothing;

create policy sketch_admin_write on storage.objects
  for all to authenticated
  using (bucket_id = 'sketches' and is_admin())
  with check (bucket_id = 'sketches' and is_admin());

-- ============================================================
-- SEED ตัวอย่าง (ลบทิ้งได้)
-- ============================================================
insert into lots (lot_number, capacity) values (3, 10);

insert into queue_entries (lot_number, code, customer_name, commission_type,
                           character_count, dimensions, note, stage,
                           payment_status, amount_paid, paid_at)
values (3, 'MK001', 'Mook', 'Half Body', 2, '3000 x 4000 px',
        'โทนสีอุ่น พื้นหลังเรียบ ส่งไฟล์ PNG + PSD', 'coloring',
        'paid', 2400, now());
