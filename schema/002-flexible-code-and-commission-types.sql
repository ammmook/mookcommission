-- ============================================================
-- ต่อคิว / TorQueue — migration 002
--
-- 1) รหัสคิว: ให้แอดมินตั้งเองได้อิสระ ไม่บังคับรูปแบบ MK001
-- 2) ประเภทงาน: ย้ายจากค่าคงที่ใน frontend มาเก็บเป็นตาราง
--
-- รันไฟล์นี้ใน Supabase SQL Editor หลังจาก torqueue_schema.sql
-- ============================================================

-- ---------- 1) รหัสคิวแบบอิสระ ----------
-- ของเดิมคือ check (code ~ '^[A-Z]{2}[0-9]{3}$') ซึ่งบังคับ MK001
-- ถอดออก แล้วเหลือแค่กันค่าว่างกับความยาวเกินจำเป็น
-- (unique constraint บน code ยังอยู่เหมือนเดิม — รหัสยังห้ามซ้ำ)

-- CHECK เดิมถูกประกาศแบบไม่มีชื่อ Postgres จึงตั้งชื่อให้เอง
-- ถ้า hard-code ชื่อผิด `drop ... if exists` จะเงียบ ๆ ไม่ทำอะไร แล้วกฎเดิมยังอยู่
-- จึงค้นหาจากนิยามของ constraint แทน (ตัวที่ใช้ ~ กับคอลัมน์ code)
do $$
declare
  con_name text;
  dropped  int := 0;
begin
  for con_name in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace ns on ns.oid = rel.relnamespace
    where ns.nspname = 'public'
      and rel.relname = 'queue_entries'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%code%~%'
  loop
    execute format('alter table queue_entries drop constraint %I', con_name);
    dropped := dropped + 1;
  end loop;

  raise notice 'ถอด CHECK รูปแบบรหัสออก % รายการ', dropped;
end $$;

alter table queue_entries
  drop constraint if exists queue_entries_code_length_check;

alter table queue_entries
  add constraint queue_entries_code_length_check
  check (char_length(btrim(code)) between 1 and 24);

-- ---------- 2) ตารางประเภทงาน ----------
create table if not exists commission_types (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  sort_order int not null default 0,
  -- ปิดประเภทที่เลิกใช้โดยไม่ต้องลบ เพื่อไม่ให้งานเก่าเสียประวัติ
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists commission_types_order_idx
  on commission_types (sort_order, name);

alter table commission_types enable row level security;

-- อ่าน/เขียนได้เฉพาะแอดมิน เหมือนตารางอื่นในสคีมานี้
-- ลูกค้าไม่ต้องเห็นตารางนี้ เพราะ queue_entries.commission_type
-- เก็บชื่อประเภทเป็น text อยู่แล้ว และส่งออกทาง get_queue_detail()
drop policy if exists admin_all on commission_types;
create policy admin_all on commission_types
  for all to authenticated
  using (is_admin()) with check (is_admin());

insert into commission_types (name, sort_order) values
  ('Bust', 1),
  ('Half Body', 2),
  ('Full Body', 3)
on conflict (name) do nothing;

-- หมายเหตุ: ตั้งใจไม่ผูก foreign key จาก queue_entries.commission_type
-- มาที่ตารางนี้ เพราะงานเก่าที่ประเภทถูกลบ/เปลี่ยนชื่อ ควรเก็บชื่อเดิมไว้ตามที่ตกลงกับลูกค้า
