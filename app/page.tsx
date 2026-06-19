import { Navbar } from "@/components/ui/navbar";
import { HeroSection } from "@/components/sections/hero-section";
import { TechMarquee } from "@/components/sections/tech-marquee";
import { FeaturesSection } from "@/components/sections/features-section";
import { ImpactSection } from "@/components/sections/impact-section";
import { PortfolioSection } from "@/components/sections/portfolio-section";
import { PricingSection } from "@/components/sections/how-to-work";
import { EquipoSection } from "@/components/sections/equipo-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { FaqSection } from "@/components/sections/faq-section";
import { CtaSection } from "@/components/sections/cta-section";
import { FooterSection } from "@/components/sections/footer-section";
import { FloatingWhatsApp } from "@/components/ui/floating-whatsapp";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950">
      <Navbar />
      <HeroSection />
      <TechMarquee />
      <FeaturesSection />
      <ImpactSection />
      <PortfolioSection />
      <PricingSection />
      <EquipoSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />
      <FooterSection />
      <FloatingWhatsApp />
    </main>
  );
}
