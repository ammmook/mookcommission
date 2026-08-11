import { HomeHero } from "@/components/home/HomeHero";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

export default function LandingPage() {
  return (
    <>
      <SiteHeader />

      <main className="flex flex-1 flex-col bg-cream">
        <HomeHero />
      </main>

      <SiteFooter />
    </>
  );
}
