import { PageContainer } from "@/components/layout/PageContainer";
import { QueueHeader } from "@/components/queue/QueueHeader";
import { QueueSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function QueueLoading() {
  return (
    <>
      <QueueHeader title="คิวของคุณ" />
      <main className="flex-1 bg-cream pb-6">
        <PageContainer className="py-4 sm:py-6 lg:py-8">
          <div className="grid items-start gap-4 lg:grid-cols-[1.35fr_0.8fr] lg:gap-6">
            <QueueSkeleton />
            <div className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-3 rounded-card border-[1.5px] border-line bg-surface p-5">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="size-9 shrink-0 rounded-xl" still />
                    <Skeleton className="h-3.5 flex-1" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-16 rounded-card" />
            </div>
          </div>
        </PageContainer>
      </main>
    </>
  );
}
