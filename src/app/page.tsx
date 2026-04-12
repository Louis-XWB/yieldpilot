import { NavHeader } from "@/components/shared/nav-header";
import { Hero } from "@/components/landing/hero";
import { StatsTicker } from "@/components/landing/stats-ticker";
import { FeatureCards } from "@/components/landing/feature-cards";

export default function LandingPage() {
  return (
    <>
      <NavHeader />
      <main>
        <Hero />
        <StatsTicker />
        <FeatureCards />
        <footer className="py-12 text-center text-text-muted text-sm border-t border-card-border/50">
          <p>
            YieldPilot — AI DeFi Fund Manager | Powered by{" "}
            <a href="https://li.fi" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">LI.FI</a>{" "}
            Earn
          </p>
        </footer>
      </main>
    </>
  );
}
