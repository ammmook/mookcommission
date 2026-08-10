-- ============================================================
-- ต่อคิว / TorQueue — migration 003
--
-- 1) เก็บอีเมลลูกค้า
-- 2) เปิดให้ฝั่งลูกค้าอ่านชื่อร้าน + บัญชีติดต่อได้ผ่าน RPC
--
-- รันใน Supabase SQL Editor ต่อจาก 002
-- ============================================================

-- ---------- 1) อีเมลลูกค้า ----------
alter table queue_entries
  add column if not exists email text;

-- เช็คหลวม ๆ พอกันพิมพ์ผิด ไม่ได้ validate ตาม RFC เต็มรูปแบบ
alter table queue_entries
  drop constraint if exists queue_entries_email_check;

alter table queue_entries
  add constraint queue_entries_email_check
  check (email is null or email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$');

-- ตั้งใจ "ไม่" เพิ่ม email เข้า view queue_public
-- เพราะใครก็ตามที่เดารหัสคิวถูกจะเห็นอีเมลคนอื่นทันที
-- อีเมลจึงเป็นข้อมูลฝั่งแอดมินเท่านั้น

-- ---------- 2) ชื่อร้าน + บัญชีติดต่อ สำหรับฝั่งลูกค้า ----------
-- site_settings มี RLS เป็น admin-only ลูกค้าอ่านตรง ๆ ไม่ได้
-- จึงเปิดผ่าน RPC แบบเดียวกับ get_active_lot / find_queue / get_queue_detail
-- คืนเฉพาะ 2 คอลัมน์ที่ต้องแสดงบนเว็บ ไม่ได้เปิดทั้งตาราง
create or replace function get_site_settings()
returns table (studio_name text, contact_handle text)
language sql stable security definer set search_path = public as $$
  select s.studio_name, s.contact_handle
  from site_settings s
  limit 1;
$$;

grant execute on function get_site_settings() to anon, authenticated;
