import { PageTransition } from "@/components/providers/page-transition";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Features } from "@/components/marketing/features";

export default function HomePage() {
  return (
    <PageTransition>
      <Hero />
      <HowItWorks />
      <Features />
    </PageTransition>
  );
}
