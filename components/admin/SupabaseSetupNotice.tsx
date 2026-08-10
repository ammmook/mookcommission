import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/ui/EmptyState";

/**
 * Shown instead of an admin screen when `.env.local` has no Supabase
 * credentials. Uses the same EmptyState the rest of the app uses, so a missing
 * setup step reads as a state of the product rather than a crash.
 */
export function SupabaseSetupNotice() {
  return (
    <main className="flex flex-1 items-center bg-cream">
      <PageContainer width="narrow" className="py-8 sm:py-12">
        <EmptyState
          className="mx-auto max-w-md"
          dashed
          visual={
            <span
              aria-hidden="true"
              className="grid size-17.5 place-items-center rounded-2xl bg-amber-bg text-2xl"
            >
              🔌
            </span>
          }
          title="ยังไม่ได้เชื่อมต่อฐานข้อมูล"
          description="คัดลอกไฟล์ .env.local.example เป็น .env.local แล้วใส่ NEXT_PUBLIC_SUPABASE_URL และ NEXT_PUBLIC_SUPABASE_ANON_KEY จากนั้นรีสตาร์ท dev server"
        />
      </PageContainer>
    </main>
  );
}
