import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CtaSection } from "@/components/sections/cta-section";
import { FeatureGrid } from "@/components/sections/feature-grid";
import { HeroSection } from "@/components/sections/hero-section";
import { PricingSection } from "@/components/sections/pricing-section";
import { WorkflowSection } from "@/components/sections/workflow-section";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <SiteHeader />
      <main>
        <HeroSection />
        <FeatureGrid />
        <WorkflowSection />
        <PricingSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
