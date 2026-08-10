/**
 * Turns Supabase/Postgres failures into a sentence the artist can act on.
 *
 * The raw message is still logged for developers — only the UI copy is
 * softened, so nobody ever reads "duplicate key value violates unique
 * constraint queue_entries_code_key" on screen.
 */

import type { PostgrestError } from "@supabase/supabase-js";

export interface AppError {
  /** Thai copy, safe to render. */
  message: string;
  /** The underlying error, for `console.error`. */
  cause?: unknown;
}

const GENERIC = "บันทึกข้อมูลไม่สำเร็จ ลองใหม่อีกครั้ง";

function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    "code" in error
  );
}

/**
 * `constraint`/`details` are richer than `code` alone for telling apart the
 * several unique indexes on these tables.
 */
function fromUnique(error: PostgrestError): string {
  const haystack = `${error.message} ${error.details ?? ""}`.toLowerCase();
  if (haystack.includes("one_open_lot")) {
    return "มีล็อตที่เปิดอยู่แล้ว — ปิดล็อตนั้นก่อนจึงจะเปิดล็อตนี้ได้";
  }
  if (haystack.includes("code")) {
    return "รหัสค้นหานี้ถูกใช้ไปแล้ว ลองรหัสอื่น";
  }
  if (haystack.includes("lot_number, queue_number")) {
    return "เลขคิวนี้ถูกใช้ไปแล้วในล็อตนี้ ลองใหม่อีกครั้ง";
  }
  if (haystack.includes("doc_number")) {
    return "เลขที่ใบเสนอราคาซ้ำ ลองกดออกใบอีกครั้ง";
  }
  if (haystack.includes("entry_id")) {
    return "ลูกค้ารายนี้มีใบเสนอราคาอยู่แล้ว";
  }
  if (haystack.includes("lots_pkey")) {
    return "หมายเลขล็อตนี้มีอยู่แล้ว";
  }
  return "ข้อมูลนี้ซ้ำกับที่มีอยู่แล้วในระบบ";
}

function fromCheck(error: PostgrestError): string {
  const haystack = `${error.message} ${error.details ?? ""}`.toLowerCase();
  if (haystack.includes("code")) {
    // Before migration 002 the database still enforced `^[A-Z]{2}[0-9]{3}$`,
    // so mention that as the likely cause without asserting it.
    return (
      "ฐานข้อมูลไม่รับรหัสค้นหานี้ — ถ้ายังไม่ได้รัน " +
      "schema/002-flexible-code-and-commission-types.sql รหัสต้องเป็นตัวอักษรใหญ่ 2 ตัว + ตัวเลข 3 หลัก เช่น MK001"
    );
  }
  if (haystack.includes("character_count")) {
    return "จำนวนตัวละครต้องมากกว่า 0";
  }
  if (haystack.includes("qty")) {
    return "จำนวนของแต่ละรายการต้องมากกว่า 0";
  }
  if (haystack.includes("capacity")) {
    return "จำนวนคิวสูงสุดต้องมากกว่า 0";
  }
  return "ข้อมูลบางช่องไม่ถูกต้อง ตรวจสอบอีกครั้ง";
}

export function toAppError(error: unknown, fallback = GENERIC): AppError {
  if (!error) return { message: fallback };

  if (isPostgrestError(error)) {
    // The `assign_queue_number()` trigger raises these in Thai already.
    if (error.message.includes("เต็มแล้ว")) {
      return { message: "ล็อตนี้เต็มแล้ว — เพิ่มความจุหรือเลือกล็อตอื่น", cause: error };
    }
    if (error.message.includes("ปิดไปแล้ว")) {
      return { message: "ล็อตนี้ปิดรับคิวแล้ว — เปิดล็อตก่อนหรือเลือกล็อตอื่น", cause: error };
    }

    switch (error.code) {
      case "23505":
        return { message: fromUnique(error), cause: error };
      case "23514":
        return { message: fromCheck(error), cause: error };
      case "23503":
        return {
          message:
            "ลบไม่ได้เพราะยังมีข้อมูลอื่นอ้างอิงอยู่ — ย้ายหรือลบลูกค้าในล็อตก่อน",
          cause: error,
        };
      case "42703":
      case "PGRST204":
        return {
          message:
            "ฐานข้อมูลยังไม่มีคอลัมน์ที่เวอร์ชันนี้ต้องใช้ — รัน schema/002 และ schema/003 ใน Supabase SQL Editor ก่อน",
          cause: error,
        };
      case "42501":
        return {
          message: "ไม่มีสิทธิ์ทำรายการนี้ — ลองเข้าสู่ระบบใหม่อีกครั้ง",
          cause: error,
        };
      case "PGRST301":
      case "PGRST302":
        return { message: "เซสชันหมดอายุ — กรุณาเข้าสู่ระบบใหม่", cause: error };
      default:
        return { message: fallback, cause: error };
    }
  }

  if (error instanceof Error) {
    if (/fetch|network|timeout/i.test(error.message)) {
      return { message: "เชื่อมต่อไม่ได้ ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่", cause: error };
    }
    // `supabaseEnv()` throws with copy that is already user-facing.
    if (error.message.startsWith("ยังไม่ได้ตั้งค่า Supabase")) {
      return { message: error.message, cause: error };
    }
  }

  return { message: fallback, cause: error };
}

/** Logs for developers, returns the Thai copy for the UI. */
export function reportError(error: unknown, fallback?: string): string {
  const app = toAppError(error, fallback);
  if (app.cause) console.error("[torqueue]", app.cause);
  return app.message;
}
