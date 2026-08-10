import { PageContainer } from "@/components/layout/PageContainer";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ArtPlaceholder } from "@/components/ui/ArtPlaceholder";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center bg-cream">
        <PageContainer width="narrow" className="py-10">
          <EmptyState
            className="mx-auto max-w-md"
            visual={
              <ArtPlaceholder label="404" className="size-24 rounded-full" />
            }
            title="ไม่พบหน้านี้"
            description="ลิงก์อาจหมดอายุหรือพิมพ์ผิด ลองกลับไปที่หน้าค้นหาคิว"
            action={
              <LinkButton href="/" size="lg" fullWidth>
                กลับหน้าแรก
              </LinkButton>
            }
          />
        </PageContainer>
      </main>
      <SiteFooter />
    </>
  );
}
